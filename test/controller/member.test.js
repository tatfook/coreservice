const { app, assert } = require('egg-mock/bootstrap');

describe('test/controller/member.test.js', () => {
    describe('# POST /members/bulk', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .post('/api/v0/members/bulk')
                .expect(401);
        });

        it('## bad request', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/members/bulk')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectType: '5',
                    memberIds: [ 5 ],
                })
                .expect(422);
        });

        it('## object not exist', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/members/bulk')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: '1',
                    objectType: '5',
                    memberIds: [ 5 ],
                })
                .expect(400);
        });

        it('## create project members successfully', async () => {
            const user = await app.login();
            const project = await app.factory.create('projects', {}, { user });
            await app
                .httpRequest()
                .post('/api/v0/members/bulk')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: project.id,
                    objectType: '5',
                    memberIds: [],
                })
                .expect(200);
            const memberIds = [];
            for (let i = 1; i <= 100; i++) {
                memberIds.push(i);
            }
            await app
                .httpRequest()
                .post('/api/v0/members/bulk')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: project.id,
                    objectType: '5',
                    memberIds,
                })
                .expect(200);
            const count = await app.model.members.count();
            assert(count === 100);
        });

        it('## create site members successfully', async () => {
            const user = await app.login();
            const site = await app.factory.create('sites', {}, { user });

            const memberIds = [];
            for (let i = 1; i <= 100; i++) {
                memberIds.push(i);
            }
            await app
                .httpRequest()
                .post('/api/v0/members/bulk')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: site.id,
                    objectType: '1',
                    memberIds,
                })
                .expect(200);
            const count = await app.model.members.count();
            assert(count === 100);
        });

        it('## create group members successfully', async () => {
            const user = await app.login();
            const group = await app.factory.create('groups', {}, { user });

            const memberIds = [];
            for (let i = 1; i <= 100; i++) {
                memberIds.push(i);
            }
            await app
                .httpRequest()
                .post('/api/v0/members/bulk')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: group.id,
                    objectType: '3',
                    memberIds,
                })
                .expect(200);
            const count = await app.model.members.count();
            assert(count === 100);
        });
    });

    describe('# GET /members/exist', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .get('/api/v0/members/exist')
                .expect(401);
        });

        it('## bad request', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .get('/api/v0/members/exist')
                .set('Authorization', `Bearer ${user.token}`)
                .query({
                    objectId: 'aa',
                })
                .expect(422);
        });

        it('## success', async () => {
            const user = await app.login();
            const project = await app.factory.create('projects', {}, { user });
            await app
                .httpRequest()
                .get('/api/v0/members/exist')
                .set('Authorization', `Bearer ${user.token}`)
                .query({
                    objectId: project.id,
                    objectType: 5,
                    memberId: user.id,
                })
                .expect(200)
                .then(res => {
                    assert(!res.body);
                });
            const memberIds = [ user.id ];
            await app
                .httpRequest()
                .post('/api/v0/members/bulk')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: project.id,
                    objectType: '5',
                    memberIds,
                })
                .expect(200);
            await app
                .httpRequest()
                .get('/api/v0/members/exist')
                .set('Authorization', `Bearer ${user.token}`)
                .query({
                    objectId: project.id,
                    objectType: 5,
                    memberId: user.id,
                })
                .expect(200)
                .then(res => {
                    assert(res.body);
                });
        });
    });

    describe('# GET /members', () => {
        it('## bad request', async () => {
            await app
                .httpRequest()
                .get('/api/v0/members')
                .expect(422);
        });

        it('## success', async () => {
            const user = await app.login();
            const project = await app.factory.create('projects', {}, { user });
            await app
                .httpRequest()
                .post('/api/v0/members/bulk')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: project.id,
                    objectType: '5',
                    memberIds: [ user.id ],
                })
                .expect(200);
            const result = await app
                .httpRequest()
                .get('/api/v0/members')
                .query({
                    objectType: 5,
                    objectId: project.id,
                })
                .expect(200)
                .then(res => res.body);
            assert(result);
        });
    });

    describe('# POST /members', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .post('/api/v0/members')
                .expect(401);
        });

        it('## bad request', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/members')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    memberId: 5,
                })
                .expect(422);
        });

        it('## not found object', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/members')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    memberId: 5,
                    objectId: 1,
                    objectType: 5,
                })
                .expect(400);
        });

        it('## success', async () => {
            const user = await app.login();
            const project = await app.factory.create('projects', {}, { user });
            const result = await app
                .httpRequest()
                .post('/api/v0/members')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    memberId: 5,
                    objectId: project.id,
                    objectType: 5,
                })
                .expect(200)
                .then(res => res.body);
            assert(
                result &&
                    result.memberId === 5 &&
                    result.objectId === project.id
            );
            const member = await app.model.members.findOne();
            assert(member);
        });
    });

    describe('# DELETE /members/:id', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .delete('/api/v0/members/5')
                .expect(401);
        });

        it('## bad request', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .delete('/api/v0/members/aaa')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(422);
        });

        it('## not found', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .delete('/api/v0/members/1')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(404);
        });

        it('## success', async () => {
            const user = await app.login();
            const project = await app.factory.create('projects', {}, { user });
            const result = await app
                .httpRequest()
                .post('/api/v0/members')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    memberId: 100,
                    objectId: project.id,
                    objectType: 5,
                })
                .expect(200)
                .then(res => res.body);
            await app
                .httpRequest()
                .delete(`/api/v0/members/${result.id}`)
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200);
            const member = await app.model.members.findOne();
            assert(!member);
        });
    });

    describe('# GET /members/:id', () => {
        it('## show', async () => {
            const user = await app.login();
            const project = await app.factory.create('projects', {}, { user });
            const result = await app
                .httpRequest()
                .post('/api/v0/members')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    memberId: 100,
                    objectId: project.id,
                    objectType: 5,
                })
                .expect(200)
                .then(res => res.body);
            const result2 = await app
                .httpRequest()
                .get(`/api/v0/members/${result.id}`)
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => res.body);
            assert(result2);
        });
    });
});
