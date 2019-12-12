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

    describe('#destroySite', () => {
        let user;
        let site;
        beforeEach(async () => {
            user = await app.factory.create('users');
            site = await ctx.service.site.createSite({
                userId: user.id,
                username: user.username,
                sitename: 'test',
            });
        });
        it('should destroy site', async () => {
            const result = await ctx.service.site.destroySite(site.id, user.id);
            assert(result);
        });

        it('should failed to destroy site if not exist', async () => {
            const errMessage = 'should failed to delete site';
            try {
                await ctx.service.site.destroySite(site.id + 1, user.id);
                ctx.throw(errMessage);
            } catch (e) {
                assert(e.errMessage !== errMessage);
            }
        });

        it('should failed to destroy site if missing userId', async () => {
            const errMessage = 'should failed to delete site';
            try {
                await ctx.service.site.destroySite(site.id);
                ctx.throw(errMessage);
            } catch (e) {
                assert(e.errMessage !== errMessage);
            }
        });
    });

    describe('#updateVisiblity', () => {
        let user;
        let site;
        beforeEach(async () => {
            user = await app.factory.create('users');
            site = await ctx.service.site.createSite({
                userId: user.id,
                username: user.username,
                sitename: 'test',
            });
        });
        it('should update site visibility', async () => {
            const result = await ctx.service.site.updateVisiblity(
                site.id,
                user.id,
                0 // 'public'
            );
            assert(result);
        });

        it('should failed to update site visibility if not exist', async () => {
            const errMessage = 'should failed to update site visibility';
            try {
                await ctx.service.site.updateVisiblity(site.id + 1, user.id, 0);
                ctx.throw(errMessage);
            } catch (e) {
                assert(e.errMessage !== errMessage);
            }
        });

        it('should failed to update site visibility if missing userId', async () => {
            const errMessage = 'should failed to update site visibility';
            try {
                await ctx.service.site.updateVisiblity(site.id, null, 0);
                ctx.throw(errMessage);
            } catch (e) {
                assert(e.errMessage !== errMessage);
            }
        });

        it('should failed to update site visibility if missing visibility', async () => {
            const errMessage = 'should failed to update site visibility';
            try {
                await ctx.service.site.updateVisiblity(site.id, user.id);
                ctx.throw(errMessage);
            } catch (e) {
                assert(e.errMessage !== errMessage);
            }
        });

        it('should failed to update site visibility with invalid visibility', async () => {
            const errMessage = 'should failed to update site visibility';
            try {
                await ctx.service.site.updateVisiblity(site.id, user.id, 99);
                ctx.throw(errMessage);
            } catch (e) {
                assert(e.errMessage !== errMessage);
            }
        });
    });
});
