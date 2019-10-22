'use strict';

const base32 = require('hi-base32');
const Service = require('egg').Service;

class World extends Service {
    getArchiveUrl(username, worldName) {
        const config = this.app.config.self.gitlab;
        const host = config.host;
        const baseWorldName = this.base32(worldName);
        const gitUsername = config.usernamePrefix + username;

        return `${host}/${gitUsername}/${baseWorldName}/repository/archive.zip`;
    }

    async generateDefaultWorld(worldName) {
        const userInfo = this.ctx.state.user;
        const token = this.ctx.state.token;
        if (!userInfo || !userInfo.username) {
            // console.log('未认证');
            return false;
        }

        const baseWorldName = this.base32(worldName);

        const {
            gitlabToken,
            gitlabUsername,
        } = await this.app.gitGateway.getUserGitlabTokenAndUsername(token);

        if (!gitlabToken) {
            // console.log('未找gitlab token');
            return false;
        }

        const result = await this.app.git.isProjectExist(
            gitlabToken,
            gitlabUsername,
            baseWorldName
        );

        if (!result) {
            const result = await this.app.git.createProject(
                gitlabToken,
                baseWorldName
            );

            if (result) {
                return true;
            }
            // console.log('创建GIT项目失败', result);
            return false;
        }
    }

    async removeProject(worldName) {
        const userInfo = this.ctx.state.user;
        const token = this.ctx.state.token;
        if (!userInfo || !userInfo.username) {
            // console.log('未认证');
            return false;
        }

        const {
            gitlabToken,
            gitlabUsername,
        } = await this.app.gitGateway.getUserGitlabTokenAndUsername(token);

        if (!gitlabToken) {
            // console.log('未找gitlab token');
            return false;
        }

        const baseWorldName = this.base32(worldName);

        try {
            await this.app.git.removeProject(
                gitlabToken,
                gitlabUsername,
                baseWorldName
            );
            return true;
        } catch (error) {
            return false;
        }
    }

    base32(text) {
        if (text) {
            const notLetter = text.match(/[^a-zA-Z]/g);

            if (notLetter) {
                text = base32.encode(text);

                text = text.replace(/[=]/g, '');
                text = text.toLocaleLowerCase();

                text = 'world_base32_' + text;
            } else {
                text = 'world_' + text;
            }

            return text;
        }
        return null;
    }

    unbase32(text) {
        if (text) {
            const notLetter = text.match('world_base32_');

            if (notLetter) {
                text = text.replace('world_base32_', '');

                return base32.decode(text);
            }
            text = text.replace('world_', '');

            return text;
        }
        return null;
    }
}

module.exports = World;
