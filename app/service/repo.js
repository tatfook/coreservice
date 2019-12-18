'use strict';

const Service = require('egg').Service;

class RepoService extends Service {
    // TODO: 在gitlab数据迁移完成之后可以移除
    async syncIfExist(repo) {
        const { ctx, service } = this;
        const repoPath = repo.path;
        try {
            const porject = await service.gitlab.getProject(repoPath);
            await service.repo.syncRepo(repo);
            await this.app.api.git.syncRepo(repoPath, porject.http_url_to_repo);
            return true;
        } catch (e) {
            ctx.logger.error(repoPath, ' not exist. err: ', e.message);
        }
    }

    async syncRepo(repo, transaction) {
        if (repo.synced) return;
        let gitRepo = await this.service.repo
            .getRepoInfo(repo.path)
            .catch(() => {}); // 如果git repo已经存在则直接返回同步成功
        if (!gitRepo) {
            gitRepo = await this.service.repo.createRepo(
                repo.username,
                repo.repoName
            );
        }
        if (gitRepo) return repo.update({ synced: true }, { transaction });
    }

    async destroyRepo(resourceType, resourceId, transaction) {
        const { ctx, service } = this;
        const repo = await ctx.model.Repo.findOne({
            where: {
                resourceType,
                resourceId,
            },
            transaction,
        });
        if (!repo) ctx.throw('repo not exist', 404);

        if (repo.synced) {
            try {
                await service.repo.deleteRepo(repo.path);
            } catch (e) {
                // 注：如果在上一次失败的删除操作事务中已经执行了repo删除，那么再次尝试删除就会出现此error。
                // 目前缺乏针对事务间调用的补偿措施
                ctx.logger.error('Repo Error: ', e.message);
            }
        }
        return repo.destroy({ transaction });
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

    // git file apis

    async createRepo(username, name) {
        return this.app.api.git.createRepo(username, name);
    }

    async getRepoInfo(repoPath) {
        return this.app.api.git.getRepoInfo(repoPath);
    }

    async getCommitInfo(repoPath, commitId, ref) {
        return this.app.api.git.getCommitInfo(repoPath, commitId, ref);
    }

    async deleteRepo(repoPath) {
        return this.app.api.git.deleteRepo(repoPath);
    }

    async downloadRepo(repoPath, ref) {
        return this.app.api.git.downloadRepo(repoPath, ref);
    }

    async renameRepo(repoPath, newRepoName) {
        return this.app.api.git.renameRepo(repoPath, newRepoName);
    }

    async createFolder(repoPath, folderPath, committer) {
        return this.app.api.git.createFolder(repoPath, folderPath, committer);
    }

    async getFolderFiles(repoPath, folderPath, recursive, commitId, ref) {
        return this.app.api.git.getFolderFiles(
            repoPath,
            folderPath,
            recursive,
            commitId,
            ref
        );
    }

    async deleteFolder(repoPath, folderPath, committer) {
        // TODO: sync all folder files for site
        return this.app.api.git.deleteFolder(repoPath, folderPath, committer);
    }

    async moveFolder(repoPath, folderPath, newFolderPath) {
        if (!newFolderPath) this.ctx.throw('invalid new folder path', 400);
        // TODO: sync all folder files for site
        return this.app.api.git.moveFolder(repoPath, folderPath, newFolderPath);
    }

    async createFile(repo, filePath, content, encoding, committer) {
        const { app } = this;
        const result = await app.api.git.upsertFile(
            repo.path,
            filePath,
            content,
            encoding,
            committer
        );
        if (repo.isSite()) {
            // sync data to es
            const site = await app.model.Site.findOne({
                where: { id: repo.resourceId },
            });
            const visibilityName = app.model.Site.visibilityName(
                site.visibility
            );
            await app.api.es.createPage(
                site.username,
                site.sitename,
                filePath,
                content,
                visibilityName
            );
        }
        return result;
    }

    async updateFile(repo, filePath, content, encoding, committer) {
        const result = await this.app.api.git.upsertFile(
            repo.path,
            filePath,
            content,
            encoding,
            committer
        );
        if (repo.isSite()) {
            // sync data to es
            await this.app.api.es.updatePage(filePath, content);
        }
        return result;
    }

    async deleteFile(repo, filePath, committer) {
        const result = await this.app.api.git.deleteFile(
            repo.path,
            filePath,
            committer
        );
        if (repo.isSite()) {
            // sync data to es
            await this.app.api.es.deletePage(filePath);
        }
        return result;
    }

    async getFileInfo(repoPath, filePath, commitId) {
        return this.app.api.git.getFileInfo(repoPath, filePath, commitId);
    }

    async getFileRaw(repoPath, filePath, commitId) {
        return this.app.api.git.getFileRaw(repoPath, filePath, commitId);
    }

    async getFileHistory(repoPath, filePath, commitId) {
        return this.app.api.git.getFileHistory(repoPath, filePath, commitId);
    }

    async moveFile(repo, filePath, newFilePath, committer) {
        const { ctx, app, service } = this;
        if (!newFilePath) ctx.throw('invalid new file path', 400);
        const result = await app.api.git.moveFile(
            repo.path,
            filePath,
            newFilePath,
            committer
        );
        if (repo.isSite()) {
            // sync data to es
            const site = await app.model.Site.findOne({
                where: { id: repo.resourceId },
            });
            const content = await service.repo.getFileRaw(
                repo.path,
                newFilePath
            );
            const visibilityName = app.model.Site.visibilityName(
                site.visibility
            );
            await app.api.es.deletePage(filePath);
            await app.api.es.createPage(
                site.username,
                site.sitename,
                newFilePath,
                content,
                visibilityName
            );
        }
        return result;
    }
}

module.exports = RepoService;
