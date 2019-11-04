'use strict';
const axios = require('axios');
class Git {
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

        this.gitlabApi = this.app.config.self.gitlabURL || '';
        this.paracraftDefaultProject =
            this.app.config.self.paracraftDefaultProject || '';

        if (!this.gitlabApi || !this.paracraftDefaultProject) {
            this.isConfigRight = false;
        }

        if (!this.app) {
            this.isConfigRight = false;
        }
    }

    async writeFile(token, username, projectName, path, content) {
        if (!this.isConfigRight) {
            return false;
        }

        const url = `${this.gitlabApi}/projects/${this.getProjectPath(
            username,
            projectName
        )}/repository/files/${encodeURIComponent(path || '')}`;

        const reciveData = await this.getContent(
            token,
            username,
            projectName,
            path
        );
        const params = {
            content,
            branch: 'master',
            commit_message: path,
        };

        if (reciveData) {
            try {
                await this.axios(token).put(url, params);

                return true;
            } catch (error) {
                return false;
            }
        } else {
            try {
                await this.axios(token).post(url, params);

                return true;
            } catch (error) {
                return false;
            }
        }
    }

    async getContent(token, username, projectName, path, ref) {
        const url = `${this.gitlabApi}/projects/${this.getProjectPath(
            username,
            projectName
        )}/repository/files/${encodeURIComponent(path || '')}?ref=${ref ||
            'master'}`;

        try {
            const response = await this.axios(token).get(url);

            if (response && response.data) {
                return response.data;
            }
        } catch (error) {
            return false;
        }
    }

    getProjectPath(username, projectName) {
        return encodeURIComponent(`${username || ''}/${projectName || ''}`);
    }

    axios(token) {
        return axios.create({
            headers: {
                'Private-Token': token || '',
                'Content-Type': 'application/json',
            },
        });
    }

    async createProject(token, projectName) {
        const url = `${this.gitlabApi}/projects`;
        const params = {
            name: projectName,
            visibility: 'public',
        };

        try {
            const response = await this.axios(token).post(url, params);
            if (response && response.data) {
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    async removeProject(token, username, projectName) {
        const url = `${this.gitlabApi}/projects/${this.getProjectPath(
            username,
            projectName
        )}`;

        try {
            const response = await this.axios(token).delete(url);
            if (response && response.data) {
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    async isProjectExist(token, username, projectName) {
        const url = `${this.gitlabApi}/projects/${this.getProjectPath(
            username,
            projectName
        )}`;

        try {
            const response = await this.axios(token).get(url);

            if (response && response.data) {
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }
}

module.exports = app => {
    const config = app.config.self;

    app.git = new Git(config, app);
};
