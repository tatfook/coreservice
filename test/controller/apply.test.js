const { app, assert } = require('egg-mock/bootstrap');

describe('test/controller/apply.test.js', () => {
    describe('# GET /applies/state', () => {
        it('## bad request', async () => {
            await app
                .httpRequest()
                .get('/api/v0/applies/state')
                .expect(422);
        });

        it('## not apply', async () => {
            await app
                .httpRequest()
                .get('/api/v0/applies/state')
                .query({
                    objectId: 1,
                    objectType: 5,
                    applyType: 0,
                    applyId: 1,
                })
                .expect(200)
                .then(res => assert(res.body === -1));
        });

        it('## get apply states', async () => {
            const apply = await app.factory.create('applies', { state: 2 });
            await app
                .httpRequest()
                .get('/api/v0/applies/state')
                .query({
                    objectId: 1,
                    objectType: 5,
                    applyType: 0,
                    applyId: 1,
                })
                .expect(200)
                .then(res => assert(res.body === apply.state));
        });
    });

    describe('# POST /applies', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .post('/api/v0/applies')
                .expect(401);
        });

        it('## bad request', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/applies')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(422);
        });

        it('## success', async () => {
            const user = await app.login();
            const project = await app.factory.create('projects');
            await app
                .httpRequest()
                .post('/api/v0/applies')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: project.id,
                    objectType: 5,
                    applyId: user.id,
                    applyType: 0,
                    legend: 'testtest',
                })
                .expect(200)
                .then(res => {
                    assert(res.body && res.body.legend === 'testtest');
                });
        });
    });

    describe('# PUT /applies/:id', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .put('/api/v0/applies/2')
                .expect(401);
        });

        it('## bad request', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .put('/api/v0/applies/2')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    state: 3,
                })
                .expect(422);
        });

        it('## not found', async () => {
            const user = await app.login();
            const apply = await app.factory.create('applies');
            await app
                .httpRequest()
                .put('/api/v0/applies/99')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    state: 2,
                })
                .expect(400);
            await app
                .httpRequest()
                .put('/api/v0/applies/99')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    state: 1,
                })
                .expect(400);
            await app
                .httpRequest()
                .put(`/api/v0/applies/${apply.id}`)
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    state: 1,
                })
                .expect(400);
            await app
                .httpRequest()
                .put(`/api/v0/applies/${apply.id}`)
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    state: 2,
                })
                .expect(400);
        });

        it('## successfully', async () => {
            const user = await app.login();
            const apply = await app.factory.create('applies', {}, { user });
            await app
                .httpRequest()
                .put(`/api/v0/applies/${apply.id}`)
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    state: 1,
                })
                .expect(200);
            await app
                .httpRequest()
                .put(`/api/v0/applies/${apply.id}`)
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    state: 2,
                })
                .expect(200);
        });
    });

    describe('# GET /applies', () => {
        it('## bad request', async () => {
            await app
                .httpRequest()
                .get('/api/v0/applies')
                .expect(422);
        });

        it('## success', async () => {
            await app
                .httpRequest()
                .get('/api/v0/applies')
                .query({
                    objectType: 5,
                    objectId: 1,
                    applyType: 0,
                })
                .expect(200)
                .then(res => {
                    assert(!res.body.length);
                });
            const project = await app.factory.create('projects');
            const apply = await app.factory.create('applies', {}, { project });
            await app
                .httpRequest()
                .get('/api/v0/applies')
                .query({
                    objectType: 5,
                    objectId: project.id,
                    applyType: 0,
                })
                .expect(200)
                .then(res => {
                    assert(res.body.length && res.body[0].id === apply.id);
                });
        });
    });

    describe('# GET /applies/search', () => {
        it('## success', async () => {
            await app.factory.create('applies');
            await app
                .httpRequest()
                .post('/api/v0/applies/search')
                .expect(200)
                .then(res => {
                    assert(res.body);
                });
        });
    });
});
