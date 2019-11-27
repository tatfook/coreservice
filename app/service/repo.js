'use strict';

const Service = require('egg').Service;

class RepoService extends Service {
    // TODO: 在gitlab数据迁移完成之后可以移除
    async syncIfExist(repo) {
        if (repo.synced) return;
        const { ctx, service } = this;
        const repoPath = `${repo.username}/${repo.repoName}`;
        const porject = await service.gitlab.getProject(repoPath).catch(err => {
            ctx.logger.error(repoPath, ' not exist. err: ', err.message);
        });
        if (porject) {
            return service.repo.syncRepo(repo);
        }
    }

    async syncRepo(repo, transaction) {
        if (repo.synced) return;
        const { service } = this;
        const result = await service.git.createRepo(
            repo.username,
            repo.repoName
        );

        if (result) return repo.update({ synced: true }, { transaction });
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
        if (repo.synced) await service.git.deleteRepo(repo.path);
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
}

module.exports = RepoService;
