const { app, assert } = require('egg-mock/bootstrap');

describe('/test/controller/project.test.js', () => {
    describe('# GET /projects/:id/game', () => {
        it('## bad request', async () => {
            await app
                .httpRequest()
                .get('/api/v0/projects/aaa/game')
                .expect(400);
        });

        it("## can't find, should return 404", async () => {
            await app
                .httpRequest()
                .get('/api/v0/projects/1/game')
                .expect(404);
        });

        it("## can't find, should return 404", async () => {
            await app
                .httpRequest()
                .get('/api/v0/projects/1/game')
                .expect(404);
        });

        it('## find game successfully', async () => {
            await app.factory.create('gameWorks');
            const result = await app
                .httpRequest()
                .get('/api/v0/projects/1/game')
                .expect(200)
                .then(res => res.body);
            assert(result.id === 1);
        });
    });

    describe('# GET /projects/join', () => {
        it('## no user bad request', async () => {
            await app
                .httpRequest()
                .get('/api/v0/projects/join')
                .expect(400);
        });

        it('## unauth, get visiable projects of user', async () => {
            const user = await app.factory.create('users');
            const project = await app.factory.create('projects', {}, { user });
            let result = await app
                .httpRequest()
                .get('/api/v0/projects/join')
                .query({ userId: user.id })
                .expect(200)
                .then(res => res.body);
            assert(result && !result[0]);
            await app.model.members.create({
                userId: user.id,
                memberId: user.id,
                objectId: project.id,
                objectType: 5,
            });
            result = await app
                .httpRequest()
                .get('/api/v0/projects/join')
                .query({ userId: user.id })
                .expect(200)
                .then(res => res.body);
            assert(result && result[0] && result[0].id === project.id);
        });

        it('## auth, get visiable projects of user', async () => {
            const user = await app.login();
            const project = await app.factory.create('projects', {}, { user });
            let result = await app
                .httpRequest()
                .get('/api/v0/projects/join')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => res.body);
            assert(result && !result[0]);
            await app.model.members.create({
                userId: user.id,
                memberId: user.id,
                objectId: project.id,
                objectType: 5,
            });
            result = await app
                .httpRequest()
                .get('/api/v0/projects/join')
                .query({ userId: user.id })
                .expect(200)
                .then(res => res.body);
            assert(result && result[0] && result[0].id === project.id);
        });
    });

    describe('# POST /projects/search', () => {
        it('## get projects successfully', async () => {
            await app.factory.createMany('projects', 100, {}, {});
            const result = await app
                .httpRequest()
                .post('/api/v0/projects/search')
                .send({})
                .set('x-per-page', 10)
                .expect(200)
                .then(res => res.body);
            assert(result.count === 100);
            assert(result.rows.length === 10);
        });
    });

    describe('# POST /projects/searchForParacraft', () => {
        it('## bad request', async () => {
            await app
                .httpRequest()
                .post('/api/v0/projects/searchForParacraft')
                .send({ tagIds: [ 'aa', 2 ] })
                .expect(400);
        });

        it('## should success', async () => {
            await app
                .httpRequest()
                .post('/api/v0/projects/searchForParacraft')
                .send({ tagIds: [ 1, 2 ], sortTag: 1, projectId: 1 })
                .expect(200);
        });
    });

    describe('# GET /projects/:id/detail', () => {
        it('## bad request', async () => {
            await app
                .httpRequest()
                .get('/api/v0/projects/aa/detail')
                .expect(400);
        });

        it('## not found', async () => {
            await app
                .httpRequest()
                .get('/api/v0/projects/1/detail')
                .expect(404);
        });

        it('## get projects successfully', async () => {
            const project = await app.factory.create('projects', { type: 0 });
            const result = await app
                .httpRequest()
                .get(`/api/v0/projects/${project.id}/detail`)
                .expect(200)
                .then(res => res.body);
            assert(result.id === project.id);
            assert(result.favoriteCount === 0);
            assert(result.world === undefined);
        });

        it('## get projects with world successfully', async () => {
            const project = await app.factory.create('projects', { type: 1 });
            await app.model.worlds.create({
                projectId: project.id,
                worldName: 'test',
                userId: 1,
            });
            const result = await app
                .httpRequest()
                .get(`/api/v0/projects/${project.id}/detail`)
                .expect(200)
                .then(res => res.body);
            assert(result.id === project.id);
            assert(result.world);
        });
    });

    describe('# GET /projects/:id/visit', () => {
        it('## not found return 404', async () => {
            await app
                .httpRequest()
                .get('/api/v0/projects/1/visit')
                .expect(404);
        });

        it('## add visit successfully', async () => {
            const project = await app.factory.create('projects');
            await app
                .httpRequest()
                .get(`/api/v0/projects/${project.id}/visit`)
                .expect(200);
        });
    });

    describe('# GET /projects/:id/star', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .get('/api/v0/projects/1/star')
                .expect(401);
        });

        it('## not found return 404', async () => {
            const { token } = await app.login();
            await app
                .httpRequest()
                .get('/api/v0/projects/1/star')
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });

        it('## unstared', async () => {
            const user = await app.login();
            const project = await app.factory.create('projects');
            const result = await app
                .httpRequest()
                .get(`/api/v0/projects/${project.id}/star`)
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => res.body);
            assert(result === false);
        });

        it('## stared', async () => {
            const user = await app.login();
            const project = await app.factory.create('projects', {
                stars: [ user.id ],
            });
            const result = await app
                .httpRequest()
                .get(`/api/v0/projects/${project.id}/star`)
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => res.body);
            assert(result === true);
        });
    });

    describe('# POST /projects/:id/star', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .post('/api/v0/projects/1/star')
                .expect(401);
        });

        it('## not found return 404', async () => {
            const { token } = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/projects/1/star')
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });

        it('## star successfully', async () => {
            const user = await app.login();
            const project = await app.factory.create('projects');
            await app
                .httpRequest()
                .post(`/api/v0/projects/${project.id}/star`)
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200);
            const result = await app
                .httpRequest()
                .get(`/api/v0/projects/${project.id}/star`)
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => res.body);
            assert(result === true);
        });
    });

    describe('# POST /projects/:id/unstar', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .post('/api/v0/projects/1/unstar')
                .expect(401);
        });

        it('## not found return 404', async () => {
            const { token } = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/projects/1/unstar')
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });

        it('## unstar successfully', async () => {
            const user = await app.login();
            const project = await app.factory.create('projects');
            await app
                .httpRequest()
                .post(`/api/v0/projects/${project.id}/star`)
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200);

            await app
                .httpRequest()
                .post(`/api/v0/projects/${project.id}/unstar`)
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200);
            const result = await app
                .httpRequest()
                .get(`/api/v0/projects/${project.id}/star`)
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => res.body);
            assert(result === false);
        });
    });

    describe('# RESOURCE /project', () => {
        describe('## create projects', () => {
            it('### unauthorized', async () => {
                await app
                    .httpRequest()
                    .post('/api/v0/projects')
                    .expect(401);
            });

            it('### create world projects successfully', async () => {
                const user = await app.login();
                await app
                    .httpRequest()
                    .post('/api/v0/projects')
                    .set('Authorization', `Bearer ${user.token}`)
                    .send({
                        name: 'test',
                        type: 1,
                    })
                    .expect(200);
                const project = await app.model.projects.findOne();
                const member = await app.model.projects.findOne();
                const world = await app.model.worlds.findOne();
                assert(project && member && world);
            });

            it('### create world projects failed', async () => {
                app.mockService('world', 'createWorldByProject', function() {
                    throw Error('failed');
                });
                const user = await app.login();
                const result = await app
                    .httpRequest()
                    .post('/api/v0/projects')
                    .set('Authorization', `Bearer ${user.token}`)
                    .send({
                        name: 'test',
                        type: 1,
                    })
                    .expect(400)
                    .then(res => res.body);
                assert(result.code === 9);
                const project = await app.model.projects.findOne();
                const world = await app.model.worlds.findOne();
                assert(!project && !world);
            });

            it('### create site projects successfully', async () => {
                const user = await app.login();
                await app
                    .httpRequest()
                    .post('/api/v0/projects')
                    .set('Authorization', `Bearer ${user.token}`)
                    .send({
                        name: 'test',
                        type: 0,
                    })
                    .expect(200);
                const project = await app.model.projects.findOne();
                const world = await app.model.worlds.findOne();
                assert(project && !world);
            });
        });

        describe('## update projects', () => {
            it('### just update project without world', async () => {
                const user = await app.login();
                const world = await app.factory.create('worlds', {}, { user });
                await app
                    .httpRequest()
                    .put(`/api/v0/projects/${world.projectId}`)
                    .set('Authorization', `Bearer ${user.token}`)
                    .send({
                        visibility: 1,
                    })
                    .expect(200);
                const project = await app.model.projects.findOne();
                assert(project.dataValues.visibility === 1);
            });

            it('### update project name', async () => {
                const user = await app.login();
                const world = await app.factory.create('worlds', {}, { user });
                await app
                    .httpRequest()
                    .put(`/api/v0/projects/${world.projectId}`)
                    .set('Authorization', `Bearer ${user.token}`)
                    .send({
                        visibility: 1,
                        extra: { worldTagName: 'test' },
                    })
                    .expect(200);
                const _world = await app.model.worlds.findOne();
                assert(_world.extra.worldTagName === 'test');
            });
        });

        describe('## destroy projects', () => {
            it('### delete successfully', async () => {
                const user = await app.login();
                let project = await app.factory.create(
                    'projects',
                    {},
                    { user }
                );
                app.mockService('world', 'destroyWorldByProject', function() {
                    return true;
                });
                await app
                    .httpRequest()
                    .delete(`/api/v0/projects/${project.id}`)
                    .set('Authorization', `Bearer ${user.token}`)
                    .expect(200);
                await app
                    .httpRequest()
                    .delete(`/api/v0/projects/${project.id + 1}`)
                    .set('Authorization', `Bearer ${user.token}`)
                    .expect(200);
                project = await app.model.projects.findOne();
                assert(!project);
            });
            it('### delete failed', async () => {
                const user = await app.login();
                let world = await app.factory.create('worlds', {}, { user });
                app.mockService('world', 'destroyWorldByProject', function() {
                    throw Error('failed');
                });
                await app
                    .httpRequest()
                    .delete(`/api/v0/projects/${world.projectId}`)
                    .set('Authorization', `Bearer ${user.token}`)
                    .expect(400);
                const project = await app.model.projects.findOne();
                world = await app.model.worlds.findOne();
                assert(project && world);
            });
        });

        describe('## index projects', () => {
            it('### no user bad request', async () => {
                await app
                    .httpRequest()
                    .get('/api/v0/projects')
                    .expect(400);
            });

            it('### unauth, get visiable projects of user', async () => {
                const user = await app.factory.create('users');
                const project = await app.factory.create(
                    'projects',
                    {},
                    { user }
                );
                const result = await app
                    .httpRequest()
                    .get('/api/v0/projects')
                    .query({ userId: user.id })
                    .expect(200)
                    .then(res => res.body);
                assert(result && result[0] && result[0].id === project.id);
            });

            it('### auth, get visiable projects of user', async () => {
                const user = await app.login();
                const project = await app.factory.create(
                    'projects',
                    {},
                    { user }
                );
                const result = await app
                    .httpRequest()
                    .get('/api/v0/projects')
                    .set('Authorization', `Bearer ${user.token}`)
                    .expect(200)
                    .then(res => res.body);
                assert(result && result[0] && result[0].id === project.id);
            });
        });
    });
});
