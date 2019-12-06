'use strict';

const Service = require('egg').Service;

class SiteService extends Service {
    async createSite({ userId, username, sitename }) {
        const { ctx } = this;
        const transaction = await ctx.model.transaction();
        try {
            const site = await ctx.model.Site.create(
                {
                    userId,
                    username,
                    sitename,
                },
                { transaction }
            );
            const repo = await ctx.service.repo.generateFromSite(
                site,
                transaction
            );
            await ctx.service.repo.syncRepo(repo, transaction);
            await transaction.commit();
            return site;
        } catch (e) {
            ctx.logger.error(e.message);
            await transaction.rollback();
            ctx.throw('Failed to create site', 400);
        }
    }

    async destroySite(id, userId) {
        const { ctx, app } = this;
        const site = await ctx.model.Site.getById(id, userId);
        if (!site) ctx.throw('Invalid site', 400);
        const transaction = await ctx.model.transaction();
        try {
            const repo = ctx.model.Repo.findOne({
                where: { resourceType: 'Site', resourceId: id },
                transaction,
            });
            await app.api.es.deleteSite(repo.path); // delete site related pages
            await ctx.model.SiteGroup.destroy({
                where: { userId, siteId: id },
                transaction,
            });
            await ctx.model.SiteFile.destroy({
                where: { userId, siteId: id },
                transaction,
            });
            await ctx.service.repo.destroyRepo('Site', site.id, transaction);
            await ctx.model.Site.destroy({
                where: { id },
                transaction,
                individualHooks: true,
            });
            await transaction.commit();
        } catch (e) {
            ctx.logger.error(e.message);
            await transaction.rollback();
            ctx.throw('Failed to destroy site', 400);
        }
    }
}

module.exports = SiteService;
