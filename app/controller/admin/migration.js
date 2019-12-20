'use strict';

const Controller = require('../../core/controller.js');

const Migration = class extends Controller {
    async generateSiteRepo() {
        this.adminAuthenticated();

        const { ctx, service } = this;
        const pace = 1000;
        let step = 0;
        const total = await ctx.model.Site.count();
        ctx.logger.info('Generating site repos, total amount is ', total);
        while (step < total) {
            const sites = await ctx.model.Site.findAll({
                offset: step,
                limit: pace,
            });
            const transaction = await ctx.model.transaction();
            try {
                await Promise.all(
                    sites.map(site => {
                        return service.repo.generateFromSite(site, transaction);
                    })
                );
                await transaction.commit();
            } catch (e) {
                ctx.logger.error(e.message);
                await transaction.rollback();
            }
            step = step + pace;
        }
        ctx.logger.info('Finish to generate site repos!');
        ctx.body = 'success';
    }

    async generateWorldRepo() {
        this.adminAuthenticated();

        const { ctx, service } = this;
        const pace = 1000;
        let step = 0;
        const total = await ctx.model.World.count();
        ctx.logger.info('Generating world repos, total amount is ', total);
        while (step < total) {
            const worlds = await ctx.model.World.findAll({
                offset: step,
                limit: pace,
            });
            const transaction = await ctx.model.transaction();
            try {
                await Promise.all(
                    worlds.map(world => {
                        return service.repo.generateFromWorld(
                            world,
                            transaction
                        );
                    })
                );
                await transaction.commit();
            } catch (e) {
                ctx.logger.error(e.message);
                await transaction.rollback();
            }
            step = step + pace;
        }
        ctx.logger.info('Finish to generate world repos!');
        ctx.body = 'success';
    }

    async syncRepo() {
        this.adminAuthenticated();

        const { ctx, service } = this;
        const pace = 10;
        let step = 0;
        const total = await ctx.model.Repo.count();
        ctx.logger.info('Begin to sync repos, total amount is ', total);
        while (step < total) {
            const repos = await ctx.model.Repo.findAll({
                offset: step,
                limit: pace,
            });
            await Promise.all(
                repos.map(repo => {
                    return service.repo.syncIfExist(repo);
                })
            );
            step = step + pace;
        }
        ctx.logger.info('Finish to sync repos!');
        ctx.body = 'success';
    }
};

module.exports = Migration;
