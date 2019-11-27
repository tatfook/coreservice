const { app, mock, assert } = require('egg-mock/bootstrap');
describe('test/controller/site.test.js', () => {
    describe('# GET /sites/getByName', () => {
        it('## bad request', async () => {
            await app
                .httpRequest()
                .get('/api/v0/sites/getByName')
                .expect(400);
        });

        it('## user not exist', async () => {
            await app
                .httpRequest()
                .get('/api/v0/sites/getByName')
                .query({
                    username: '测试',
                    sitename: '测试网站',
                })
                .expect(404);
        });

        it('## user exist and site not exist', async () => {
            await app.factory.create('users', { username: '测试' });
            await app
                .httpRequest()
                .get('/api/v0/sites/getByName')
                .query({
                    username: '测试',
                    sitename: '测试网站',
                })
                .expect(404);
        });

        it('## get successfully', async () => {
            await app.factory.create('users', { username: '测试' });
            await app.factory.create('sites', {
                userId: 1,
                sitename: '测试网站',
            });
            const result = await app
                .httpRequest()
                .get('/api/v0/sites/getByName')
                .query({
                    username: '测试',
                    sitename: '测试网站',
                })
                .expect(200)
                .then(res => res.body);
            assert(result.user);
            assert(result.site);
        });
    });

    describe('# GET /sites/:id/privilege', () => {
        // 用户对网站的权限
        it("## site not found don't have privilege", async () => {
            const result = await app
                .httpRequest()
                .get('/api/v0/sites/1/privilege')
                .expect(200)
                .then(res => res.body);
            assert(result === 128);
        });

        it("## private site don't have privilege", async () => {
            const site = await app.factory.create('sites');
            const result = await app
                .httpRequest()
                .get(`/api/v0/sites/${site.id}/privilege`)
                .expect(200)
                .then(res => res.body);
            assert(result === 128);
        });

        it("## private site don't have privilege", async () => {
            const site = await app.factory.create('sites');
            const result = await app
                .httpRequest()
                .get(`/api/v0/sites/${site.id}/privilege`)
                .expect(200)
                .then(res => res.body);
            assert(result === 128);
        });

        it('## public site have read-only privilege', async () => {
            const site = await app.factory.create('sites', { visibility: 0 });
            const result = await app
                .httpRequest()
                .get(`/api/v0/sites/${site.id}/privilege`)
                .expect(200)
                .then(res => res.body);
            assert(result === 32);
        });

        it('## self-owned site have write privilege', async () => {
            const user = await app.login();
            const { token } = user;
            const site = await app.factory.create(
                'sites',
                { visibility: 0 },
                { user }
            );
            const result = await app
                .httpRequest()
                .get(`/api/v0/sites/${site.id}/privilege`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => res.body);
            assert(result === 64);
        });

        // TODO
    });
    describe('# POST sites/:id/groups', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .post('/api/v0/sites/2/groups')
                .expect(401);
        });

        it('## bad request', async () => {
            const { token } = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/sites/2/groups')
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
        });

        it('## site not exist', async () => {
            const { token } = await app.login();
            const result = await app
                .httpRequest()
                .post('/api/v0/sites/1/groups')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    groupId: 1,
                    level: 128,
                })
                .expect(400)
                .then(res => res.text);
            assert(result.indexOf('用户站点不存在') !== -1);
        });

        it('## group not exist', async () => {
            const user = await app.login();
            const { token } = user;
            const site = await app.factory.create('sites', {}, { user });
            const result = await app
                .httpRequest()
                .post(`/api/v0/sites/${site.id}/groups`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    groupId: 1,
                    level: 128,
                })
                .expect(400)
                .then(res => res.text);
            assert(result.indexOf('用户组不存在') !== -1);
        });

        it('## success', async () => {
            const user = await app.login();
            const { token } = user;
            const site = await app.factory.create('sites', {}, { user });
            const group = await app.factory.create('groups');
            const result = await app
                .httpRequest()
                .post(`/api/v0/sites/${site.id}/groups`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    groupId: group.id,
                    level: 128,
                })
                .expect(200)
                .then(res => res.body);
            assert(result.id === 1);
            assert(result.userId === 1);
            assert(result.siteId === 1);
            assert(result.groupId === 1);
            assert(result.level === 128);
        });
    });

    describe('# PUT /sites/:id/groups', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .put('/api/v0/sites/2/groups')
                .expect(401);
        });

        it('## bad request', async () => {
            const { token } = await app.login();
            await app
                .httpRequest()
                .put('/api/v0/sites/2/groups')
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
        });

        it('## success', async () => {
            const user = await app.login();
            const { token } = user;
            const site = await app.factory.create('sites', {}, { user });
            const group = await app.factory.create('groups');
            await app
                .httpRequest()
                .post(`/api/v0/sites/${site.id}/groups`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    groupId: 1,
                    level: 128,
                })
                .expect(200);
            const result2 = await app
                .httpRequest()
                .put(`/api/v0/sites/${site.id}/groups`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    groupId: group.id,
                    level: 64,
                })
                .expect(200)
                .then(res => res.body);
            assert(result2[0] === 1);
            const siteGroup = await app.model.siteGroups.findOne({
                where: { id: 1 },
            });
            assert(siteGroup.level === 64);
        });
    });

    describe('## DELETE /sites/:id/groups', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .delete('/api/v0/sites/2/groups')
                .expect(401);
        });

        it('## bad request', async () => {
            const { token } = await app.login();
            await app
                .httpRequest()
                .delete('/api/v0/sites/2/groups')
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
        });

        it('## success', async () => {
            const user = await app.login();
            const { token } = user;
            const site = await app.factory.create('sites', {}, { user });
            const group = await app.factory.create('groups');
            await app
                .httpRequest()
                .post(`/api/v0/sites/${site.id}/groups`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    groupId: group.id,
                    level: 128,
                })
                .expect(200);
            const result2 = await app
                .httpRequest()
                .delete(`/api/v0/sites/${site.id}/groups`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    groupId: group.id,
                })
                .expect(200)
                .then(res => res.body);
            assert(result2 === 1);
            const siteGroup = await app.model.siteGroups.findOne();
            assert(!siteGroup);
        });
    });

    describe('# GET /sites/:id/groups', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .get('/api/v0/sites/1/groups')
                .expect(401);
        });

        it('## bad request', async () => {
            const { token } = await app.login();
            await app
                .httpRequest()
                .get('/api/v0/sites/aa/groups')
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
        });

        it('## success', async () => {
            const user = await app.login();
            const { token } = user;
            const site = await app.factory.create('sites', {}, { user });
            const group = await app.factory.create('groups', {
                groupname: 'test',
            });
            await app
                .httpRequest()
                .post(`/api/v0/sites/${site.id}/groups`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    groupId: group.id,
                    level: 128,
                })
                .expect(200);
            const result2 = await app
                .httpRequest()
                .get(`/api/v0/sites/${site.id}/groups`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => res.body);
            assert(Array.isArray(result2));
            assert(result2[0].groupname === 'test');
        });
    });

    describe('# RESOURCE /sites', () => {
        it('## create sites', async () => {
            await app
                .httpRequest()
                .post('/api/v0/sites')
                .expect(401);
            const { token } = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/sites')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    sitename: '',
                })
                .expect(400);
            const result = await app
                .httpRequest()
                .post('/api/v0/sites')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    sitename: 'my',
                })
                .expect(200)
                .then(res => res.body);
            assert(result.sitename === 'my');
            await app
                .httpRequest()
                .post('/api/v0/sites')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    sitename: 'my',
                })
                .expect(409);
        });

        it('## show one site', async () => {
            await app
                .httpRequest()
                .get('/api/v0/sites/1')
                .expect(204);
            await app.factory.create('sites');
            const result = await app
                .httpRequest()
                .get('/api/v0/sites/1')
                .expect(200)
                .then(res => res.body);
            assert(result.id === 1);
        });

        it('## update one site', async () => {
            const { token } = await app.login();
            await app.factory.create('sites', { userId: 2, id: 1 });
            const body = {
                sitename: 'aaa',
            };
            await app
                .httpRequest()
                .put('/api/v0/sites/1')
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
            await app.factory.create('sites', { userId: 1, id: 2 });
            await app
                .httpRequest()
                .put('/api/v0/sites/2')
                .send(body)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            const site = await app.model.sites.findOne({
                where: {
                    id: 2,
                    userId: 1,
                },
            });
            assert(site.sitename === body.sitename);
            body.visibility = 0;
            mock(app.api, 'setGitProjectVisibility', function() {});
            await app
                .httpRequest()
                .put('/api/v0/sites/2')
                .send(body)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
        });

        it('## delete one site', async () => {
            const { token } = await app.login();
            await app.factory.create('sites', { userId: 2, id: 1 });
            await app
                .httpRequest()
                .delete('/api/v0/sites/1')
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
            await app.factory.create('sites', { userId: 1, id: 2 });
            await app
                .httpRequest()
                .delete('/api/v0/sites/2')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            const site = await app.model.sites.findOne({
                where: {
                    id: 2,
                    userId: 1,
                },
            });
            assert(!site);
        });

        it('## index sites', async () => {
            const { token } = await app.login();
            await app.factory.create('sites', { userId: 1, id: 1 });
            const result = await app
                .httpRequest()
                .get('/api/v0/sites')
                .query({
                    owned: true,
                    membership: true,
                })
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => res.body);
            assert(Array.isArray(result));
        });
    });
});
