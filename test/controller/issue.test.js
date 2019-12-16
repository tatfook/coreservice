const { app, assert } = require('egg-mock/bootstrap');

describe('test/controller/issue.test.js', () => {
    describe('# POST /issues/search', () => {
        it('## bad request', async () => {
            await app
                .httpRequest()
                .post('/api/v0/issues/search')
                .send({ objectId: '1', objectType: '6' })
                .expect(422);
        });

        it('## get project issues successfully', async () => {
            const user = await app.factory.create('users');
            const project = await app.factory.create(
                'projects',
                { privilege: 32 },
                { user }
            );
            const issue = await app.factory.create(
                'issues',
                { objectId: project.id, objectType: 5, state: 0 },
                { user }
            );
            const result = await app
                .httpRequest()
                .post('/api/v0/issues/search')
                .send({
                    objectId: project.id,
                    objectType: 5,
                })
                .expect(200)
                .then(res => res.body);
            assert(result.count === 1);
            assert(result.rows[0].id === issue.id);
            assert(result.openCount === 1);
            assert(result.closeCount === 0);
        });

        it('## get project issues failed no access', async () => {
            const user = await app.factory.create('users');
            const project = await app.factory.create(
                'projects',
                { privilege: 64 },
                { user }
            );
            await app.factory.create(
                'issues',
                { objectId: project.id, objectType: 5, state: 0 },
                { user }
            );
            const result = await app
                .httpRequest()
                .post('/api/v0/issues/search')
                .send({
                    objectId: project.id,
                    objectType: 5,
                })
                .expect(400)
                .then(res => res.body);
            assert(result.code === 7);

            const result2 = await app
                .httpRequest()
                .post('/api/v0/issues/search')
                .send({
                    objectId: project.id,
                    objectType: 2,
                })
                .expect(400)
                .then(res => res.body);
            assert(result2.code === 7);
        });

        it('## project members can get project issues', async () => {
            const user = await app.login();
            const project = await app.factory.create(
                'projects',
                { privilege: 64 },
                { user }
            );
            const issue = await app.factory.create(
                'issues',
                { objectId: project.id, objectType: 5, state: 0 },
                { user }
            );
            await app.model.members.create({
                objectType: 5,
                objectId: project.id,
                memberId: user.id,
                userId: user.id,
            });
            const result = await app
                .httpRequest()
                .post('/api/v0/issues/search')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: project.id,
                    objectType: 5,
                })
                .expect(200)
                .then(res => res.body);
            assert(result.count === 1);
            assert(result.rows[0].id === issue.id);
            assert(result.openCount === 1);
            assert(result.closeCount === 0);
        });
    });

    describe('# GET /issues/statistics', () => {
        it('## bad request', async () => {
            await app
                .httpRequest()
                .get('/api/v0/issues/statistics?objectId=2&objectType=aaa')
                .expect(422);
        });

        it('## get statistics successfully', async () => {
            const user = await app.login();
            const project = await app.factory.create(
                'projects',
                { privilege: 64 },
                { user }
            );
            const issue = await app.factory.create(
                'issues',
                { objectId: project.id, objectType: 5, state: 0 },
                { user }
            );

            const result = await app
                .httpRequest()
                .get(
                    `/api/v0/issues/statistics?objectId=${issue.id}&objectType=5`
                )
                .expect(200)
                .then(res => res.body);
            assert(result[0] && result[0].state === 0 && result[0].count === 1);
        });
    });

    describe('# POST /issues', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .post('/api/v0/issues')
                .expect(401);
        });

        it('## bad request', async () => {
            const user = await app.login();

            await app
                .httpRequest()
                .post('/api/v0/issues')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(422);
        });

        it('no access to create issues', async () => {
            const user = await app.login();
            const project = await app.factory.create(
                'projects',
                { privilege: 64 },
                { user }
            );
            const result = await app
                .httpRequest()
                .post('/api/v0/issues')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: project.id,
                    objectType: 5,
                    title: 'test',
                    content: 'test',
                })
                .expect(400)
                .then(res => res.body);
            assert(result.code === 7);
        });

        it('create issues successfully', async () => {
            const user = await app.login();
            const project = await app.factory.create(
                'projects',
                { privilege: 128 },
                { user }
            );
            const result = await app
                .httpRequest()
                .post('/api/v0/issues')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: project.id,
                    objectType: 5,
                    title: 'test',
                    content: 'test',
                })
                .expect(200)
                .then(res => res.body);
            assert(result);

            const result2 = await app
                .httpRequest()
                .post('/api/v0/issues')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: project.id,
                    objectType: 5,
                    title: 'test2',
                    content: 'test2',
                })
                .expect(200)
                .then(res => res.body);
            assert(result2.no === 2);
        });
    });

    describe('# PUT /issues/:id', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .put('/api/v0/issues/1')
                .expect(401);
        });

        it('## bad request', async () => {
            const user = await app.login();

            await app
                .httpRequest()
                .put('/api/v0/issues/aaa')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(422);
        });

        it('not exist issues', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .put('/api/v0/issues/1')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(400);
        });

        it('## no access', async () => {
            const user = await app.login();
            const project = await app.factory.create(
                'projects',
                { privilege: 64 },
                { user }
            );
            const issue = await app.factory.create(
                'issues',
                { objectId: project.id, objectType: 5, state: 0 },
                { user }
            );
            const result = await app
                .httpRequest()
                .put(`/api/v0/issues/${issue.id}`)
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: project.id,
                    objectType: 5,
                    title: 'test',
                    content: 'test',
                })
                .expect(400)
                .then(res => res.body);
            assert(result.code === 7);
        });

        it('update issues successfully', async () => {
            const user = await app.login();
            const project = await app.factory.create(
                'projects',
                { privilege: 128 },
                { user }
            );
            const result = await app
                .httpRequest()
                .post('/api/v0/issues')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: project.id,
                    objectType: 5,
                    title: 'test',
                    content: 'test',
                })
                .expect(200)
                .then(res => res.body);
            assert(result);
            await app
                .httpRequest()
                .put(`/api/v0/issues/${result.id}`)
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200);
            await app
                .httpRequest()
                .put(`/api/v0/issues/${result.id}`)
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    title: 'test3',
                    content: 'test2',
                    no: '3',
                })
                .expect(200);
            const _issuse = await app.model.issues.findOne();
            // 标题修改成功
            assert(_issuse.title === 'test3');
            // 序号不会被修改
            assert(_issuse.no === result.no);
        });
    });

    describe('# GET /issues', () => {
        it('## get project issues successfully', async () => {
            const user = await app.factory.create('users');
            const project = await app.factory.create(
                'projects',
                { privilege: 32 },
                { user }
            );
            const issue = await app.factory.create(
                'issues',
                { objectId: project.id, objectType: 5, state: 0 },
                { user }
            );
            const result = await app
                .httpRequest()
                .get('/api/v0/issues')
                .send({
                    objectId: project.id,
                    objectType: 5,
                })
                .expect(200)
                .then(res => res.body);
            assert(result[0]);
            assert(result[0].id === issue.id);
        });

        it('## get project issues no access', async () => {
            const user = await app.factory.create('users');
            const project = await app.factory.create(
                'projects',
                { privilege: 64 },
                { user }
            );
            await app.factory.create(
                'issues',
                { objectId: project.id, objectType: 5, state: 0 },
                { user }
            );
            const result = await app
                .httpRequest()
                .get('/api/v0/issues')
                .send({
                    objectId: project.id,
                    objectType: 5,
                })
                .expect(400)
                .then(res => res.body);
            assert(result.code === 7);
        });
    });

    describe('# GET /issues/:id', () => {
        it('## bad request', async () => {
            await app
                .httpRequest()
                .get('/api/v0/issues/aa')
                .expect(422);
        });

        it('## not found', async () => {
            await app
                .httpRequest()
                .get('/api/v0/issues/1')
                .expect(400);
        });

        it('## no access', async () => {
            const user = await app.factory.create('users');
            const project = await app.factory.create(
                'projects',
                { privilege: 64 },
                { user }
            );
            const issue = await app.factory.create(
                'issues',
                { objectId: project.id, objectType: 5, state: 0 },
                { user }
            );
            const result = await app
                .httpRequest()
                .get(`/api/v0/issues/${issue.id}`)
                .send({
                    objectId: project.id,
                    objectType: 5,
                })
                .expect(400)
                .then(res => res.body);
            assert(result.code === 7);
        });

        it('## success', async () => {
            const user = await app.factory.create('users');
            const user2 = await app.factory.create('users');
            const project = await app.factory.create(
                'projects',
                { privilege: 32 },
                { user }
            );
            const issue = await app.factory.create(
                'issues',
                {
                    objectId: project.id,
                    objectType: 5,
                    state: 0,
                    assigns: user2.id,
                },
                { user }
            );
            const result = await app
                .httpRequest()
                .get(`/api/v0/issues/${issue.id}`)
                .send({
                    objectId: project.id,
                    objectType: 5,
                })
                .expect(200)
                .then(res => res.body);
            assert(result.id === issue.id);
        });
    });

    describe('# DELETE /issues/:id', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .delete('/api/v0/issues/1')
                .expect(401);
        });
        it('## bad request', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .delete('/api/v0/issues/aa')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(422);
        });

        it('## not found', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .delete('/api/v0/issues/1')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(400);
        });

        it('## no access', async () => {
            const user = await app.factory.create('users');
            const user2 = await app.login();
            const project = await app.factory.create(
                'projects',
                { privilege: 64 },
                { user }
            );
            const issue = await app.factory.create(
                'issues',
                { objectId: project.id, objectType: 5, state: 0 },
                { user }
            );
            const result = await app
                .httpRequest()
                .delete(`/api/v0/issues/${issue.id}`)
                .set('Authorization', `Bearer ${user2.token}`)
                .send({
                    objectId: project.id,
                    objectType: 5,
                })
                .expect(400)
                .then(res => res.body);
            assert(result.code === 7);
        });

        it('## success', async () => {
            const user = await app.factory.create('users');
            const user2 = await app.login();
            const project = await app.factory.create(
                'projects',
                { privilege: 128 },
                { user }
            );
            const issue = await app.factory.create(
                'issues',
                {
                    objectId: project.id,
                    objectType: 5,
                    state: 0,
                    assigns: user2.id,
                },
                { user }
            );
            await app
                .httpRequest()
                .delete(`/api/v0/issues/${issue.id}`)
                .set('Authorization', `Bearer ${user2.token}`)
                .send({
                    objectId: project.id,
                    objectType: 5,
                })
                .expect(200);
            const _issuse = await app.model.issues.findOne();
            assert(!_issuse);
        });
    });
});
