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
}

module.exports = SiteService;
