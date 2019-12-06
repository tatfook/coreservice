'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/service/repo.test.js', () => {
    let ctx;
    beforeEach(async () => {
        ctx = app.mockContext();
    });

    describe('#createSite', () => {
        it('should create site', async () => {
            const user = await app.factory.create('users');
            const site = await ctx.service.site.createSite({
                userId: user.id,
                username: user.username,
                sitename: 'test',
            });
            assert(site);
            assert(site.userId === user.id);
            const repo = await ctx.model.Repo.findOne();
            assert(repo);
            assert(repo.username === user.username);
            assert(repo.resourceId === site.id);
            assert(repo.resourceType === 'Site');
        });

        it('should failed to create site if already exist', async () => {
            const site = await app.factory.create('sites');
            const errMessage = 'should failed to create site';
            try {
                await ctx.service.site.createSite(site);
                ctx.throw(errMessage);
            } catch (e) {
                assert(e.errMessage !== errMessage);
                const siteCount = await ctx.model.Site.count();
                assert(siteCount === 1);
            }
        });

        it('should failed to create site if missing userId', async () => {
            const user = await app.factory.create('users');
            const errMessage = 'should failed to create site';
            try {
                await ctx.service.site.createSite({
                    username: user.username,
                    sitename: 'test',
                });
                ctx.throw(errMessage);
            } catch (e) {
                assert(e.errMessage !== errMessage);
            }
        });

        it('should failed to create site if missing username', async () => {
            const user = await app.factory.create('users');
            const errMessage = 'should failed to create site';
            try {
                await ctx.service.site.createSite({
                    userId: user.id,
                    sitename: 'test',
                });
                ctx.throw(errMessage);
            } catch (e) {
                assert(e.errMessage !== errMessage);
            }
        });

        it('should failed to create site if missing sitename', async () => {
            const user = await app.factory.create('users');
            const errMessage = 'should failed to create site';
            try {
                await ctx.service.site.createSite({
                    userId: user.id,
                    username: user.username,
                });
                ctx.throw(errMessage);
            } catch (e) {
                assert(e.errMessage !== errMessage);
            }
        });
    });
});
