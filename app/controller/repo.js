'use strict';
const Controller = require('../core/controller.js');

const Repo = class extends Controller {
    async getTree() {
        const { ctx, service } = this;
        const repo = await this.getRepoAndEnsureReadable();
        const { folderPath, recursive } = ctx.params;
        const result = await service.repo.getFolderFiles(
            repo.path,
            folderPath,
            recursive
        );
        return this.success(result);
    }

    async download() {
        const { ctx, service } = this;
        const repo = await this.getRepoAndEnsureReadable();
        const { ref } = ctx.params;
        const result = await service.repo.downloadRepo(repo.path, ref);
        return this.success(result);
    }

    async getFileInfo() {
        const { ctx, service } = this;
        const repo = await this.getRepoAndEnsureReadable();
        const { filePath, commitId } = ctx.params;
        const result = await service.repo.getFileInfo(
            repo.path,
            filePath,
            commitId
        );
        return this.success(result);
    }

    async getFileRaw() {
        const { ctx, service } = this;
        const repo = await this.getRepoAndEnsureReadable();
        const { filePath, commitId } = ctx.params;
        const result = await service.repo.getFileRaw(
            repo.path,
            filePath,
            commitId
        );
        return this.success(result);
    }

    async getFileHistory() {
        const { ctx, service } = this;
        const repo = await this.getRepoAndEnsureWritable();
        const { filePath, commitId } = ctx.params;
        const result = await service.repo.getFileHistory(
            repo.path,
            filePath,
            commitId
        );
        return this.success(result);
    }

    async upsertFile() {
        const { ctx, service } = this;
        const repo = await this.getRepoAndEnsureWritable();
        const { filePath, content } = ctx.params;
        const committer = this.getUser().username;
        const result = await service.repo.upsertFile(
            repo.path,
            filePath,
            content,
            committer
        );
        return this.success(result);
    }

    async deleteFile() {
        const { ctx, service } = this;
        const repo = await this.getRepoAndEnsureWritable();
        const { filePath } = ctx.params;
        const committer = this.getUser().username;
        const result = await service.repo.deleteFile(
            repo.path,
            filePath,
            committer
        );
        return this.success(result);
    }

    async renameFile() {
        const { ctx, service } = this;
        const repo = await this.getRepoAndEnsureWritable();
        const { filePath, newFilePath } = ctx.params;
        const committer = this.getUser().username;
        const result = await service.repo.deleteFile(
            repo.path,
            filePath,
            newFilePath,
            committer
        );
        return this.success(result);
    }

    async createFolder() {
        const { ctx, service } = this;
        const repo = await this.getRepoAndEnsureWritable();
        const { folderPath } = ctx.params;
        const committer = this.getUser().username;
        const result = await service.repo.createFolder(
            repo.path,
            folderPath,
            committer
        );
        return this.success(result);
    }

    async deleteFolder() {
        const { ctx, service } = this;
        const repo = await this.getRepoAndEnsureWritable();
        const { folderPath } = ctx.params;
        const committer = this.getUser().username;
        const result = await service.repo.deleteFolder(
            repo.path,
            folderPath,
            committer
        );
        return this.success(result);
    }

    async renameFolder() {
        const { ctx, service } = this;
        const repo = await this.getRepoAndEnsureWritable();
        const { folderPath, newFolderPath } = ctx.params;
        const committer = this.getUser().username;
        const result = await service.repo.moveFolder(
            repo.path,
            folderPath,
            newFolderPath,
            committer
        );
        return this.success(result);
    }

    async getRepoAndEnsureReadable() {
        this.authenticated();
        const { ctx, service } = this;
        const { repoPath } = ctx.params;
        const repo = await ctx.model.Repo.findOne({
            where: { path: repoPath },
        });
        const canRead = await service.repo.canReadByUser(
            repo,
            this.getUser().userId
        );
        if (!canRead) ctx.throw('no permission to view the repo data', 403);
        return repo;
    }

    async getRepoAndEnsureWritable() {
        this.authenticated();
        const { ctx, service } = this;
        const { repoPath } = ctx.params;
        const repo = await ctx.model.Repo.findOne({
            where: { path: repoPath },
        });
        const canWrite = await service.repo.canWriteByUser(
            repo,
            this.getUser().userId
        );
        if (!canWrite) ctx.throw('no permission to edit the repo', 403);
        return repo;
    }
};

module.exports = Repo;
