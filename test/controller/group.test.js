const { app, assert } = require('egg-mock/bootstrap');

describe('test/controller/favorite.test.js', () => {
    function sleep(n) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, n);
        });
    }
    describe('# POST /groups/:id/members', () => {
        // 添加组成员
        it('## member not exist', async () => {
            const user = await app.login();
            const group = await app.factory.create('groups', {
                userId: user.id,
            });
            await app
                .httpRequest()
                .post(`/api/v0/groups/${group.id}/members`)
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    memberName: 'test',
                })
                .expect(400);
        });

        it('## group not exist', async () => {
            const user = await app.login();
            const user2 = await app.factory.create('users', {
                username: 'test',
            });
            await app
                .httpRequest()
                .post('/api/v0/groups/1/members')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    memberName: user2.username,
                })
                .expect(400);
        });

        it('## add successfully', async () => {
            const user = await app.login();
            const user2 = await app.factory.create('users', {
                username: 'test',
            });
            const group = await app.factory.create('groups', {
                userId: user.id,
            });
            await app
                .httpRequest()
                .post(`/api/v0/groups/${group.id}/members`)
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    memberName: user2.username,
                })
                .expect(200);
            const members = await app.model.members.findOne();
            assert(members);
        });
    });

    describe('# DELETE /groups/:id/members', () => {
        // 删除组成员
        it('## member not exist', async () => {
            const user = await app.login();
            const group = await app.factory.create('groups', {
                userId: user.id,
            });
            await app
                .httpRequest()
                .delete(`/api/v0/groups/${group.id}/members`)
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    memberName: 'test',
                })
                .expect(400);
        });

        it('## group not exist', async () => {
            const user = await app.login();
            const user2 = await app.factory.create('users', {
                username: 'test',
            });
            await app
                .httpRequest()
                .delete('/api/v0/groups/1/members')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    memberName: user2.username,
                })
                .expect(400);
        });

        it('## delete successfully', async () => {
            const user = await app.login();
            const user2 = await app.factory.create('users', {
                username: 'test',
            });
            const group = await app.factory.create('groups', {
                userId: user.id,
            });
            await app.model.members.create({
                userId: user.id,
                objectId: group.id,
                objectType: 3,
                memberId: user2.id,
            });
            await app
                .httpRequest()
                .delete(`/api/v0/groups/${group.id}/members`)
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    memberName: user2.username,
                })
                .expect(200);
            const members = await app.model.members.findOne();
            assert(!members);
        });
    });

    describe('# GET /groups/:id/members', () => {
        // 获取组成员
        it('## group not exist', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .get('/api/v0/groups/1/members')
                .set('Authorization', `Bearer ${user.token}`)

                .expect(400);
        });

        it('## get successfully', async () => {
            const user = await app.login();
            const user2 = await app.factory.create('users', {
                username: 'test',
            });
            const group = await app.factory.create('groups', {
                userId: user.id,
            });
            const member = await app.model.members.create({
                userId: user.id,
                objectId: group.id,
                objectType: 3,
                memberId: user2.id,
            });
            const result = await app
                .httpRequest()
                .get(`/api/v0/groups/${group.id}/members`)
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => res.body);
            assert(result[0].id === member.id);
        });
    });

    describe('# POST /groups', () => {
        // 创建组
        it('## successfully', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/groups')
                .set('Authorization', `Bearer ${user.token}`)
                .send({ groupname: 'test' })
                .expect(200);
            const group = await app.model.groups.findOne();
            assert(group);
        });

        it('## successfully with members', async () => {
            const user = await app.login();
            const users = await app.factory.createMany('users', 10);
            await app
                .httpRequest()
                .post('/api/v0/groups')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    groupname: 'test',
                    members: users.map(user => user.id),
                })
                .expect(200);
            const members = await app.model.members.findAll();
            assert(members.length === 10);
        });

        it('## same group name', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/groups')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    groupname: 'test',
                })
                .expect(200);
            await app
                .httpRequest()
                .post('/api/v0/groups')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    groupname: 'test',
                })
                .expect(409);
        });
    });

    describe('# PUT /groups/:id', () => {
        it('## success', async () => {
            const user = await app.login();
            const users = await app.factory.createMany('users', 10);
            const group = await app
                .httpRequest()
                .post('/api/v0/groups')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    groupname: 'test',
                    members: users.map(user => user.id),
                })
                .expect(200)
                .then(res => res.body);
            const members = await app.model.members.findAll();
            assert(members.length === 10);
            await sleep(500);
            const users2 = await app.factory.createMany('users', 5);
            await app
                .httpRequest()
                .put(`/api/v0/groups/${group.id}`)
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    members: users2.map(user => user.id),
                })
                .expect(200);
            const members2 = await app.model.members.findAll();
            assert(members2.length === 5);
        });

        it('## update not exist group', async () => {
            const user = await app.login();
            const users2 = await app.factory.createMany('users', 5);
            await app
                .httpRequest()
                .put('/api/v0/groups/1')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    members: users2.map(user => user.id),
                })
                .expect(200);
            const members2 = await app.model.members.findAll();
            assert(members2.length === 0);
        });
    });

    describe('# DELETE /groups/:id', () => {
        it('## success', async () => {
            const user = await app.login();
            const users = await app.factory.createMany('users', 10);
            const group = await app
                .httpRequest()
                .post('/api/v0/groups')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    groupname: 'test',
                    members: users.map(user => user.id),
                })
                .expect(200)
                .then(res => res.body);
            await app
                .httpRequest()
                .delete(`/api/v0/groups/${group.id}`)
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200);
            const members2 = await app.model.members.findAll();
            assert(members2.length === 0);
            const groups = await app.model.groups.findOne();
            assert(!groups);
        });
    });

    describe('# GET /groups/:id', () => {
        it('## success', async () => {
            const user = await app.login();
            const users = await app.factory.createMany('users', 10);
            const group = await app
                .httpRequest()
                .post('/api/v0/groups')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    groupname: 'test',
                    members: users.map(user => user.id),
                })
                .expect(200)
                .then(res => res.body);
            const result = await app
                .httpRequest()
                .get('/api/v0/groups')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => res.body);

            assert(
                result[0] &&
                result[0].id === group.id &&
                result[0].members.length === 10
            );
        });
    });
});
