'use strict';

const Service = require('egg').Service;
const axios = require('axios').default;

class RepoService extends Service {
    get marshalUrl() {
        return this.app.config.self.marshalUrl;
    }

    async createRepo(username, name) {
        const result = await axios.post(`${this.marshalUrl}/repos`, {
            space: username, // use user name as space name
            name,
        });

        return result.data;
    }

    async getRepoInfo(repoPath) {
        const result = await axios.get(`${this.marshalUrl}/repos`, {
            data: {
                repoPath,
            },
        });

        return result.data;
    }

    async deleteRepo(repoPath) {
        const result = await axios.delete(`${this.marshalUrl}/repos`, {
            data: { repoPath },
        });

        return result.data;
    }

    async downloadRepo(repoPath, ref) {
        const result = await axios.get(`${this.marshalUrl}/repos/download`, {
            data: {
                repoPath,
                ref,
            },
        });

        return result.data;
    }

    async renameRepo(repoPath, newRepoName) {
        const result = await axios.post(`${this.marshalUrl}/repos/rename`, {
            repoPath,
            newRepoName,
        });

        return result.data;
    }

    async createFolder(repoPath, folderPath = '', committer) {
        const result = await axios.get(`${this.marshalUrl}/folders`, {
            params: {
                repoPath,
                folderPath,
                committer,
            },
        });

        return result.data;
    }

    async deleteFolder(repoPath, folderPath = '', committer) {
        const result = await axios.delete(`${this.marshalUrl}/folders`, {
            params: {
                repoPath,
                folderPath,
                committer,
            },
        });

        return result.data;
    }

    async getFolderFiles(repoPath, folderPath = '', recursive) {
        const result = await axios.get(`${this.marshalUrl}/folders/files`, {
            params: {
                repoPath,
                folderPath,
                recursive,
            },
        });

        return result.data;
    }

    async moveFolder(repoPath, folderPath = '', newFolderPath) {
        const result = await axios.post(`${this.marshalUrl}/folders/move`, {
            repoPath,
            folderPath,
            newFolderPath,
        });

        return result.data;
    }

    // return commitId
    async upsertFile(repoPath, filePath, content, committer) {
        const result = await axios.post(`${this.marshalUrl}/files`, {
            repoPath,
            filePath,
            content,
            committer,
        });

        return result.data;
    }

    async deleteFile(repoPath, filePath, committer) {
        const result = await axios.delete(`${this.marshalUrl}/files`, {
            data: {
                repoPath,
                filePath,
                committer,
            },
        });

        return result.data;
    }

    async getFileInfo(repoPath, filePath, commitId) {
        const result = await axios.get(`${this.marshalUrl}/files`, {
            params: {
                repoPath,
                filePath,
                commitId,
            },
        });

        return result.data;
    }

    async getFileRaw(repoPath, filePath, commitId) {
        const result = await axios.get(`${this.marshalUrl}/files/raw`, {
            params: {
                repoPath,
                filePath,
                commitId,
            },
        });

        return result.data;
    }

    async getFileHistory(repoPath, filePath, commitId) {
        const result = await axios.get(`${this.marshalUrl}/files/history`, {
            params: {
                repoPath,
                filePath,
                commitId,
            },
        });

        return result.data;
    }

    async moveFile(repoPath, filePath, newFilePath, committer) {
        const result = await axios.post(`${this.marshalUrl}/files/move`, {
            repoPath,
            filePath,
            newFilePath,
            committer,
        });

        return result.data;
    }

    // TODO: 在gitlab数据迁移完成之后可以移除
    async syncIfExist(repo) {
        const { ctx, service } = this;
        const repoPath = `${repo.username}/${repo.repoName}`;
        const porject = await service.gitlab.getProject(repoPath).catch(err => {
            ctx.logger.error(repoPath, ' not exist. err: ', err.message);
        });
        if (porject) {
            return service.repo.syncRepo(repo);
        }
    }

    async syncRepo(repo) {
        const { service } = this;
        const result = await service.repo.createRepo(
            repo.username,
            repo.repoName
        );
        if (result) return repo.update({ synced: true });
    }

    async generateFromSite(site, transaction) {
        const attributes = {
            resourceType: 'Site',
            resourceId: site.id,
            username: site.username,
            repoName: site.sitename,
            path: `${site.username}/${site.sitename}`,
        };
        return this.ctx.model.Repo.create(attributes, { transaction });
    }

    async generateFromWorld(world, transaction) {
        const worldName = this.ctx.service.world.base32(world.worldName);
        const user = await this.ctx.model.User.findOne({
            where: { id: world.userId },
        });
        if (!user) this.ctx.logger.error('invalid world ', world.worldName);
        const attributes = {
            resourceType: 'World',
            resourceId: world.id,
            username: user.username,
            repoName: worldName,
            path: `${user.username}/${worldName}`,
        };
        return this.ctx.model.Repo.create(attributes, { transaction });
    }

    async canReadByUser(repo, userId) {
        const { ctx } = this;
        const resource = await ctx.model[repo.resourceType].findOne({
            where: { id: repo.resourceId },
        });
        if (!resource) ctx.throw('Resource does not exist.');
        return resource.canReadByUser(userId);
    }

    async canWriteByUser(repo, userId) {
        const { ctx } = this;
        const resource = await ctx.model[repo.resourceType].findOne({
            where: { id: repo.resourceId },
        });
        if (!resource) ctx.throw('Resource does not exist.');
        return resource.canWriteByUser(userId);
    }
}

module.exports = RepoService;
