'use strict';

const Service = require('egg').Service;

class SiteService extends Service {
    async createSite({ userId, username, sitename }) {
        const { ctx } = this;
        const site = await ctx.model.Site.create({
            userId,
            username,
            sitename,
        });
        const repo = await ctx.service.repo.generateFromSite(site);
        await ctx.service.repo.syncRepo(repo);
        return site;
    }

    async destroySite(id, userId) {
        const { ctx } = this;
        const site = await ctx.model.Site.getById(id, userId);
        if (!site) ctx.throw('Invalid site', 400);
        const transaction = await ctx.model.transaction();
        try {
            await ctx.service.repo.destroyRepo('Site', site.id, transaction);
            await ctx.model.SiteGroup.destroy({
                where: { userId, siteId: id },
                transaction,
            });
            await ctx.model.SiteFile.destroy({
                where: { userId, siteId: id },
                transaction,
            });
            await ctx.model.Site.destroy({ where: { id }, transaction });
            await transaction.commit();
        } catch (e) {
            ctx.logger.warn(e.message);
            await transaction.rollback();
            ctx.throw('Failed to destroy site', 400);
        }
    }
}

module.exports = SiteService;
