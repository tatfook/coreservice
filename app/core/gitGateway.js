/* eslint-disable no-magic-numbers */
'use strict';

const axios = require('axios');

class GitGateway {
    constructor(config, app) {
        this.config = config;
        this.app = app;
        this.isConfigRight = true;
        this.cacheTree = [];
        this.cacheContent = {};

        if (
            !this.app ||
            !this.app.config ||
            !this.app.config.self ||
            !this.app.config.self.secret ||
            !this.app.util ||
            !this.app.util.jwt_encode
        ) {
            this.isConfigRight = false;
        }

        this.gitGatewayApi = this.app.config.self.gitBaseURL || '';
        this.paracraftDefaultProject =
            this.app.config.self.paracraftDefaultProject || '';

        if (!this.gitGatewayApi || !this.paracraftDefaultProject) {
            this.isConfigRight = false;
        }

        if (!this.app) {
            this.isConfigRight = false;
        }
    }

    async getAdminToken() {
        if (!this.isConfigRight) {
            return false;
        }

        if (!this.adminToken) {
            this.adminToken = this.app.util.jwt_encode(
                { userId: 1, roleId: 10 },
                this.app.config.self.secret,
                3600 * 24 * 365 * 10
            );
        }

        return this.adminToken;
    }

    async getUserGitlabTokenAndUsername(token) {
        if (!this.isConfigRight || typeof token !== 'string') {
            // console.log('配置错误', this.isConfigRight, token);
            return false;
        }

        const url = `${this.gitGatewayApi}/accounts`;

        const axiosInst = axios.create({
            headers: {
                Authorization: `Bearer ${token || ''}`,
                'Content-Type': 'application/json',
            },
        });

        try {
            const response = await axiosInst.get(url);

            if (response && response.data && response.data.token) {
                return {
                    gitlabToken: response.data.token,
                    gitlabUsername: response.data.git_username,
                };
            }
            return false;
        } catch (error) {
            // console.log(error);
            return false;
        }
    }

    async createProject(userName, worldName) {
        if (
            !this.isConfigRight ||
            typeof userName !== 'string' ||
            typeof worldName !== 'string'
        ) {
            return false;
        }

        const url = `${this.gitGatewayApi}/projects/user/${userName}`;
        const adminToken = await this.getAdminToken();

        const axiosInst = axios.create({
            headers: {
                Authorization: `Bearer ${adminToken || ''}`,
                'Content-Type': 'application/json',
            },
        });

        try {
            const response = await axiosInst.post(url, {
                sitename: worldName,
                visibility: 'public',
            });

            if (response && response.data && response.data.created) {
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    async removeProject(projectPath) {
        if (!this.isConfigRight || typeof projectPath !== 'string') {
            return false;
        }

        const url = `${this.gitGatewayApi}/projects/${encodeURIComponent(
            projectPath || ''
        )}`;
        const adminToken = await this.getAdminToken();

        const axiosInst = axios.create({
            headers: {
                Authorization: `Bearer ${adminToken || ''}`,
                'Content-Type': 'application/json',
            },
        });

        try {
            const response = await axiosInst.delete(url);
            if (response && response.data && response.data.deleted) {
                return true;
            }
            this.app.logger.error('删除失败');
            return false;
        } catch (error) {
            this.app.logger.error('删除失败');
            return false;
        }
    }

    async getTree(projectPath) {
        if (!this.isConfigRight) {
            return [];
        }

        projectPath = projectPath || this.paracraftDefaultProject;

        if (projectPath === this.paracraftDefaultProject) {
            if (Array.isArray(this.cacheTree) && this.cacheTree.length > 0) {
                return this.cacheTree;
            }
        }

        const url = `${this.gitGatewayApi}/projects/${encodeURIComponent(
            projectPath
        )}/tree/?recursive`;
        let response;

        try {
            response = await axios.get(url);
        } catch (error) {}

        if (response && response.data) {
            this.cacheTree = response.data;

            return response.data;
        }
        return [];
    }

    async getContent(projectPath, path) {
        if (!this.isConfigRight || !path) {
            return '';
        }

        projectPath = projectPath || this.paracraftDefaultProject;

        const url = `${this.gitGatewayApi}/projects/${encodeURIComponent(
            projectPath
        )}/files/${encodeURIComponent(path)}`;

        if (projectPath === this.paracraftDefaultProject) {
            if (this.cacheContent[url]) {
                return this.cacheContent[url];
            }
        }

        let response;

        try {
            response = await axios.get(url);
        } catch (error) {}

        if (response && response.data && response.data.content) {
            this.cacheContent[url] = response.data.content;

            return response.data.content;
        }
        return '';
    }

    async writeFile(token, projectPath, path, content) {
        if (!this.isConfigRight || !projectPath || !path) {
            return false;
        }

        if (projectPath === this.paracraftDefaultProject) {
            return false;
        }

        const url = `${this.gitGatewayApi}/projects/${encodeURIComponent(
            projectPath
        )}/files/${encodeURIComponent(path)}`;

        const axiosInst = axios.create({
            headers: {
                Authorization: `Bearer ${token || ''}`,
                'Content-Type': 'application/json',
            },
        });

        const result = await axiosInst.post(url, {
            content,
        });

        if (result && result.data && result.data.created) {
            return true;
        }
        return false;
    }

    async isProjectExist(projectPath) {
        if (!this.isConfigRight) {
            return false;
        }

        const url = `${this.gitGatewayApi}/projects/${encodeURIComponent(
            projectPath
        ) || ''}/exist`;
        const adminToken = await this.getAdminToken();

        const axiosInst = axios.create({
            headers: {
                Authorization: `Bearer ${adminToken || ''}`,
            },
        });

        const result = await axiosInst.get(url);

        if (result && result.data) {
            return true;
        }
        return false;
    }
}

module.exports = app => {
    const config = app.config.self;

    app.gitGateway = new GitGateway(config, app);
};
