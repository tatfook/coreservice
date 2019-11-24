'use strict';

const Service = require('egg').Service;
const Axios = require('axios');

let Client;

class GitlabService extends Service {

    get client() {
        if (!Client) {
            Client = Axios.create({ baseURL: this.app.config.self.gitlabURL });
        }
        return Client;
    }

    async getProject(path) {
        const gitlabAccountPrefix = this.app.config.self.gitlab.usernamePrefix;
        const encodedPath = encodeURIComponent(`${gitlabAccountPrefix}${path}`);
        const res = await this.client.get(`/projects/${encodedPath}`);
        return res.data;
    }
}

module.exports = GitlabService;
