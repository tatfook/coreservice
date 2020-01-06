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

        it('should do nothing if repo was already synced', async () => {
            await repo.update({ synced: true });
            await repo.reload();
            const result = await ctx.service.repo.syncIfExist(repo);
            assert(!result);
        });

        it('should failed if project was exist', async () => {
            app.mockService('gitlab', 'getProject', () => {
                ctx.throw('not exist');
            });
            assert(repo.synced === false);
            const result = await ctx.service.repo.syncIfExist(repo);
            assert(!result);
            await repo.reload();
            assert(repo.synced === false);
        });
    });

    describe('#syncRepo', () => {
        let repo;
        beforeEach(async () => {
            repo = await app.factory.create('repos');
            app.mockService('repo', 'getRepoInfo', () => {
                ctx.throw('not exist');
            });
        });

        it('should sync if project was exist', async () => {
            assert(repo.synced === false);
            const result = await ctx.service.repo.syncRepo(repo);
            assert(result);
            await repo.reload();
            assert(repo.synced === true);
        });

        it('should do nothing if repo was already synced', async () => {
            await repo.update({ synced: true });
            await repo.reload();
            assert(repo.synced === true);
            const result = await ctx.service.repo.syncRepo(repo);
            assert(!result);
        });

        it('should mark syned as true if git repo was already exist', async () => {
            app.mockService('repo', 'getRepoInfo', () => {
                return {
                    name: repo.name,
                    space: repo.username,
                    path: repo.path,
                };
            });
            const result = await ctx.service.repo.syncRepo(repo);
            assert(result);
            await repo.reload();
            assert(repo.synced === true);
        });

        it('should failed if create git repo failed', async () => {
            app.mockService('repo', 'createRepo', () => {
                ctx.throw('failed');
            });
            const errMessage = 'should failed to sync repo';
            try {
                await ctx.service.repo.syncRepo(repo);
                ctx.throw(errMessage);
            } catch (e) {
                assert(e.message !== errMessage);
            }
            await repo.reload();
            assert(repo.synced === false);
        });
    });

    describe('#destroyRepo', () => {
        let repo;
        beforeEach(async () => {
            repo = await app.factory.create('repos', { synced: true });
        });

        it('should destroy repo', async () => {
            const result = await ctx.service.repo.destroyRepo(
                repo.resourceType,
                repo.resourceId
            );
            assert(result);
            const repoCount = await ctx.model.Repo.count();
            assert(repoCount === 0);
        });

        it('should destroy repo if repo was not synced', async () => {
            await repo.update({ synced: false });
            const result = await ctx.service.repo.destroyRepo(
                repo.resourceType,
                repo.resourceId
            );
            assert(result);
            const repoCount = await ctx.model.Repo.count();
            assert(repoCount === 0);
        });

        it('should failed if repo not exist', async () => {
            const errMessage = 'should failed to destroy invalid repo';
            try {
                await ctx.service.repo.destroyRepo(
                    repo.resourceType,
                    repo.resourceId + 10
                );
                ctx.throw(errMessage);
            } catch (e) {
                assert(e.message !== errMessage);
            }
            const repoCount = await ctx.model.Repo.count();
            assert(repoCount === 1);
        });

        it('should succeed if delete git repo failed', async () => {
            app.mockService('repo', 'deleteRepo', () => {
                ctx.throw('failed');
            });
            const result = await ctx.service.repo.destroyRepo(
                repo.resourceType,
                repo.resourceId
            );
            assert(result);
            const repoCount = await ctx.model.Repo.count();
            assert(repoCount === 0);
        });

        describe('#with transaction', () => {
            it('should destroy repo', async () => {
                const transaction = await ctx.model.transaction();
                await ctx.service.repo.destroyRepo(
                    repo.resourceType,
                    repo.resourceId,
                    transaction
                );
                let repoCount = await ctx.model.Repo.count();
                assert(repoCount === 1);
                await transaction.commit();
                repoCount = await ctx.model.Repo.count();
                assert(repoCount === 0);
            });
        });
    });

    describe('#canReadByUser', () => {
        let user;
        describe('site', () => {
            let site;
            let repo;
            describe('public', () => {
                beforeEach(async () => {
                    user = await app.factory.create('users');
                    site = await app.factory.create(
                        'sites',
                        { visibility: 0 },
                        { user }
                    );
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

                it('should return true if user is stranger', async () => {
                    const result = await ctx.service.repo.canReadByUser(
                        repo,
                        user.id + 100
                    );
                    assert(result === true);
                });

                it('should return true if user is visitor', async () => {
                    const result = await ctx.service.repo.canReadByUser(repo);
                    assert(result === true);
                });
            });
            describe('private', () => {
                beforeEach(async () => {
                    user = await app.factory.create('users');
                    site = await app.factory.create(
                        'sites',
                        { visibility: 1 },
                        { user }
                    );
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

                it('should return false if user is visitor', async () => {
                    const result = await ctx.service.repo.canReadByUser(repo);
                    assert(result === false);
                });
            });
        });
        describe('world', () => {
            let world;
            let repo;
            describe('without project', () => {
                beforeEach(async () => {
                    user = await app.factory.create('users');
                    world = await app.factory.create(
                        'worlds',
                        { projectId: 99999 },
                        { user }
                    );
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

                it('should return false if user is visitor', async () => {
                    const result = await ctx.service.repo.canReadByUser(repo);
                    assert(result === false);
                });
            });
            describe('public', () => {
                let project;
                beforeEach(async () => {
                    user = await app.factory.create('users');
                    project = await app.factory.create('projects', {
                        visibility: 0,
                    });
                    world = await app.factory.create(
                        'worlds',
                        {},
                        { user, project }
                    );
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

                it('should return true if user is member', async () => {
                    const user2 = await app.factory.create('users');
                    await app.factory.create('members', {
                        user,
                        objectType: 5,
                        objectId: project.id,
                        memberId: user2.id,
                    });
                    const result = await ctx.service.repo.canReadByUser(
                        repo,
                        user2.id
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

                it('should return false if user is visitor', async () => {
                    const result = await ctx.service.repo.canReadByUser(repo);
                    assert(result === false);
                });
            });
            describe('private', () => {
                let project;
                beforeEach(async () => {
                    user = await app.factory.create('users');
                    project = await app.factory.create('projects', {
                        visibility: 1,
                    });
                    world = await app.factory.create(
                        'worlds',
                        {},
                        { user, project }
                    );
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

                it('should return true if user is member', async () => {
                    const user2 = await app.factory.create('users');
                    await app.factory.create('members', {
                        user,
                        objectType: 5,
                        objectId: project.id,
                        memberId: user2.id,
                    });
                    const result = await ctx.service.repo.canReadByUser(
                        repo,
                        user2.id
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

                it('should return false if user is visitor', async () => {
                    const result = await ctx.service.repo.canReadByUser(repo);
                    assert(result === false);
                });
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
            let project;
            let repo;
            beforeEach(async () => {
                user = await app.factory.create('users');
                project = await app.factory.create('projects', {
                    visibility: 0,
                });
                world = await app.factory.create(
                    'worlds',
                    {},
                    { user, project }
                );
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

            it('should return true if user is member', async () => {
                const user2 = await app.factory.create('users');
                await app.factory.create('members', {
                    user,
                    objectType: 5,
                    objectId: project.id,
                    memberId: user2.id,
                });
                const result = await ctx.service.repo.canWriteByUser(
                    repo,
                    user2.id
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
