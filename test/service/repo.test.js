'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/service/repo.test.js', () => {
    let ctx;
    beforeEach(async () => {
        ctx = app.mockContext();
    });

    describe('#generateFromSite', () => {
        let site;
        beforeEach(async () => {
            site = await app.factory.create('sites');
        });
        it('should generate repo', async () => {
            const repo = await ctx.service.repo.generateFromSite(site);
            assert(repo);
            assert(repo.resourceId === site.id);
            assert(repo.resourceType === 'Site');
        });
        it('should failed if repo already exist', async () => {
            const errMessage = 'Should failed to generate repo';
            await ctx.service.repo.generateFromSite(site);
            try {
                await ctx.service.repo.generateFromSite(site);
                ctx.throw(errMessage);
            } catch (e) {
                assert(e.errMessage !== errMessage);
            }
        });

        describe('with transaction', () => {
            it('should generate repo', async () => {
                const transaction = await app.model.transaction();
                await ctx.service.repo.generateFromSite(site, transaction);
                let repo = await ctx.model.Repo.findOne();
                assert(repo === null);
                await transaction.commit();
                repo = await ctx.model.Repo.findOne();
                assert(repo);
                assert(repo.resourceId === site.id);
                assert(repo.resourceType === 'Site');
            });
            it('should failed if repo already exist', async () => {
                const errMessage = 'Should failed to generate repo';
                await ctx.service.repo.generateFromSite(site);
                const transaction = await ctx.model.transaction();
                try {
                    await ctx.service.repo.generateFromSite(site);
                    await transaction.commit();
                    ctx.throw(errMessage);
                } catch (e) {
                    await transaction.rollback();
                    assert(e.errMessage !== errMessage);
                }
            });
        });
    });

    describe('#generateFromWorld', () => {
        let world;
        beforeEach(async () => {
            world = await app.factory.create('worlds');
        });
        it('should generate repo', async () => {
            const repo = await ctx.service.repo.generateFromWorld(world);
            assert(repo);
            assert(repo.resourceId === world.id);
            assert(repo.resourceType === 'World');
        });
        it('should failed if repo already exist', async () => {
            const errMessage = 'Should failed to generate repo';
            await ctx.service.repo.generateFromWorld(world);
            try {
                await ctx.service.repo.generateFromWorld(world);
                ctx.throw(errMessage);
            } catch (e) {
                assert(e.errMessage !== errMessage);
            }
        });

        describe('with transaction', () => {
            it('should generate repo', async () => {
                const transaction = await app.model.transaction();
                await ctx.service.repo.generateFromWorld(world, transaction);
                let repo = await ctx.model.Repo.findOne();
                assert(repo === null);
                await transaction.commit();
                repo = await ctx.model.Repo.findOne();
                assert(repo);
                assert(repo.resourceId === world.id);
                assert(repo.resourceType === 'World');
            });
            it('should failed if repo already exist', async () => {
                const errMessage = 'Should failed to generate repo';
                await ctx.service.repo.generateFromWorld(world);
                const transaction = await ctx.model.transaction();
                try {
                    await ctx.service.repo.generateFromWorld(world);
                    await transaction.commit();
                    ctx.throw(errMessage);
                } catch (e) {
                    await transaction.rollback();
                    assert(e.errMessage !== errMessage);
                }
            });
        });
    });

    describe('#syncIfExist', () => {
        let repo;
        beforeEach(async () => {
            repo = await app.factory.create('repos');
        });

        it('should sync if project was exist', async () => {
            app.mockService('gitlab', 'getProject', repoPath => {
                return {
                    path: repoPath,
                };
            });
            assert(repo.synced === false);
            const result = await ctx.service.repo.syncIfExist(repo);
            assert(result);
            await repo.reload();
            assert(repo.synced === true);
        });

        it('should sync if project was exist', async () => {
            app.mockService('gitlab', 'getProject', () => {
                return;
            });
            assert(repo.synced === false);
            const result = await ctx.service.repo.syncIfExist(repo);
            assert(!result);
            await repo.reload();
            assert(repo.synced === false);
        });
    });

    describe('#canReadByUser', () => {
        let user;
        describe('site', () => {
            let site;
            let repo;
            beforeEach(async () => {
                user = await app.factory.create('users');
                site = await app.factory.create('sites', {}, { user });
                repo = await app.factory.create('repos', {
                    username: site.username,
                    repoName: site.sitename,
                    resourceId: site.id,
                    resourceType: 'Site',
                });
            });

            it('should return true if user is owner', async () => {
                const result = await ctx.service.repo.canReadByUser(
                    repo,
                    user.id
                );
                assert(result === true);
            });

            it('should return false if user is stranger', async () => {
                const result = await ctx.service.repo.canReadByUser(
                    repo,
                    user.id + 100
                );
                assert(result === false);
            });
        });
        describe('world', () => {
            let world;
            let repo;
            beforeEach(async () => {
                user = await app.factory.create('users');
                world = await app.factory.create('worlds', {}, { user });
                repo = await app.factory.create('repos', {
                    username: user.username,
                    repoName: world.worldName,
                    resourceId: world.id,
                    resourceType: 'World',
                });
            });

            it('should return true if user is owner', async () => {
                const result = await ctx.service.repo.canReadByUser(
                    repo,
                    user.id
                );
                assert(result === true);
            });

            it('should return true even if user is stranger', async () => {
                const result = await ctx.service.repo.canReadByUser(
                    repo,
                    user.id + 100
                );
                assert(result === true);
            });
        });
    });

    describe('#canWriteByUser', () => {
        let user;
        describe('site', () => {
            let site;
            let repo;
            beforeEach(async () => {
                user = await app.factory.create('users');
                site = await app.factory.create('sites', {}, { user });
                repo = await app.factory.create('repos', {
                    username: site.username,
                    repoName: site.sitename,
                    resourceId: site.id,
                    resourceType: 'Site',
                });
            });

            it('should return true if user is owner', async () => {
                const result = await ctx.service.repo.canWriteByUser(
                    repo,
                    user.id
                );
                assert(result === true);
            });

            it('should return false if user is stranger', async () => {
                const result = await ctx.service.repo.canWriteByUser(
                    repo,
                    user.id + 100
                );
                assert(result === false);
            });
        });
        describe('world', () => {
            let world;
            let repo;
            beforeEach(async () => {
                user = await app.factory.create('users');
                world = await app.factory.create('worlds', {}, { user });
                repo = await app.factory.create('repos', {
                    username: user.username,
                    repoName: world.worldName,
                    resourceId: world.id,
                    resourceType: 'World',
                });
            });

            it('should return true if user is owner', async () => {
                const result = await ctx.service.repo.canWriteByUser(
                    repo,
                    user.id
                );
                assert(result === true);
            });

            it('should return false if user is stranger', async () => {
                const result = await ctx.service.repo.canWriteByUser(
                    repo,
                    user.id + 100
                );
                assert(result === false);
            });
        });
    });
});
