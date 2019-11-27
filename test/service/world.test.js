'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/service/repo.test.js', () => {
    let ctx;
    let project;
    beforeEach(async () => {
        ctx = app.mockContext();
        project = await app.factory.create('projects');
    });

    describe('#createWorldByProject', () => {
        it('should create world', async () => {
            const world = await ctx.service.world.createWorldByProject(project);
            assert(world);
            assert(world.projectId === project.id);
            const repo = await ctx.model.Repo.findOne();
            assert(repo);
            assert(repo.resourceId === world.id);
            assert(repo.resourceType === 'World');
        });

        it('should failed to create world if already exist', async () => {
            await app.factory.create('worlds', {}, { project });
            const errMessage = 'should failed to create site';
            try {
                await ctx.service.world.createWorldByProject(project);
                ctx.throw(errMessage);
            } catch (e) {
                assert(e.errMessage !== errMessage);
                const worldCount = await ctx.model.World.count();
                assert(worldCount === 1);
            }
        });

        it('#with transaction', () => {
            it('should create world', async () => {
                const transaction = await ctx.model.transaction();
                await ctx.service.world.createWorldByProject(
                    project,
                    transaction
                );
                let world = await ctx.model.World.findOne();
                let repo = await ctx.model.Repo.findOne();
                assert(!world);
                assert(!repo);
                await transaction.commit();
                world = await ctx.model.World.findOne();
                repo = await ctx.model.Repo.findOne();
                assert(world);
                assert(repo);
                assert(world.projectId === project.id);
                assert(repo.resourceId === world.id);
                assert(repo.resourceType === 'World');
            });
        });
    });

    describe('#destroyWorldByProject', () => {
        it('should destroy world', async () => {
            let world = await ctx.service.world.createWorldByProject(project);
            let repo = await ctx.model.Repo.findOne();
            assert(world);
            assert(repo);
            await ctx.service.world.destroyWorldByProject(project);
            world = await ctx.model.World.findOne();
            assert(!world);
            repo = await ctx.model.Repo.findOne();
            assert(!repo);
        });

        it('should failed to destroy world if not exist', async () => {
            const errMessage = 'should failed to create site';
            try {
                await ctx.service.world.destroyWorldByProject(project);
                ctx.throw(errMessage);
            } catch (e) {
                assert(e.errMessage !== errMessage);
            }
        });

        it('#with transaction', () => {
            it('should create world', async () => {
                let world = await ctx.service.world.createWorldByProject(
                    project
                );
                let repo = await ctx.model.Repo.findOne();
                assert(world);
                assert(repo);
                const transaction = await ctx.model.transaction();
                await ctx.service.world.destroyWorldByProject(
                    project,
                    transaction
                );
                world = await ctx.model.World.findOne();
                repo = await ctx.model.Repo.findOne();
                assert(world);
                assert(repo);
                await transaction.commit();
                world = await ctx.model.World.findOne();
                repo = await ctx.model.Repo.findOne();
                assert(!world);
                assert(!repo);
            });
        });
    });
});
