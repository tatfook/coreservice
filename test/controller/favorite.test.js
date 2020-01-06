const { app, assert } = require('egg-mock/bootstrap');
const {
    ENTITY_TYPE_USER,
    ENTITY_TYPE_PROJECT,
} = require('../../app/core/consts');
describe('test/controller/favorite.test.js', () => {
    describe('# POST /favorites', () => {
        it('## create project favorite', async () => {
            const project = await app.factory.create('projects');
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/favorites')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: project.id,
                    objectType: ENTITY_TYPE_PROJECT,
                })
                .expect(200)
                .then(res => res.body);
            const updatedProject = await app.model.projects.findByPk(
                project.id
            );
            assert(updatedProject.favorite === 1);
        });

        it('## create user favorite', async () => {
            const user2 = await app.factory.create('users');

            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/favorites')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: user2.id,
                    objectType: ENTITY_TYPE_USER,
                })
                .expect(200)
                .then(res => res.body);
            const following = await app.model.userRanks.findOne({
                where: { userId: user.id },
            });
            assert(following.follow === 1);
            const followed = await app.model.userRanks.findOne({
                where: { userId: user2.id },
            });
            assert(followed.fans === 1);
        });
    });

    describe('# DELETE /favorites', () => {
        it('## unfavorite project', async () => {
            const project = await app.factory.create('projects');
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/favorites')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: project.id,
                    objectType: ENTITY_TYPE_PROJECT,
                })
                .expect(200)
                .then(res => res.body);

            await app
                .httpRequest()
                .delete('/api/v0/favorites')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: project.id,
                    objectType: ENTITY_TYPE_PROJECT,
                })
                .expect(200)
                .then(res => res.body);
            const updatedProject = await app.model.projects.findByPk(
                project.id
            );
            assert(updatedProject.favorite === 0);
        });

        it('## user unfavorite', async () => {
            const user = await app.login();
            const user2 = await app.factory.create('users');
            await app
                .httpRequest()
                .post('/api/v0/favorites')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: user2.id,
                    objectType: ENTITY_TYPE_USER,
                })
                .expect(200)
                .then(res => res.body);
            await app
                .httpRequest()
                .delete('/api/v0/favorites')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    objectId: user2.id,
                    objectType: ENTITY_TYPE_USER,
                })
                .expect(200)
                .then(res => res.body);
            const following = await app.model.userRanks.findOne({
                where: { userId: user.id },
            });
            assert(following.follow === 0);
            const followed = await app.model.userRanks.findOne({
                where: { userId: user2.id },
            });
            assert(followed.fans === 0);
        });
    });

    describe('# POST /favorites/search', () => {
        it('## search favorites', async () => {
            await app
                .httpRequest()
                .post('/api/v0/favorites/search')
                .expect(200);
        });
    });

    describe('# GET /favorites/follows', () => {
        // 获取粉丝
        it('## bad request', async () => {
            await app
                .httpRequest()
                .get('/api/v0/favorites/follows')
                .query({
                    objectId: 10,
                    objectType: 10,
                })
                .expect(400);
        });

        it('## success', async () => {
            const user = await app.factory.create('users');
            const user2 = await app.factory.create('users');
            await app.factory.create('favorites', {
                userId: user.id,
                objectId: user2.id,
                objectType: 0,
            });
            const result = await app
                .httpRequest()
                .get('/api/v0/favorites/follows')
                .query({
                    objectId: user2.id,
                    objectType: 0,
                })
                .expect(200)
                .then(res => res.body);
            assert(result[0].id === user.id);
        });
    });

    describe('# GET /favorites/exist', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .get('/api/v0/favorites/exist')
                .query({
                    objectId: 10,
                    objectType: 10,
                })
                .expect(401);
        });
        it('## bad request', async () => {
            const loginUser = await app.login();
            await app
                .httpRequest()
                .get('/api/v0/favorites/exist')
                .set('Authorization', `Bearer ${loginUser.token}`)
                .query({
                    objectId: 10,
                    objectType: 10,
                })
                .expect(400);
        });

        it('## success', async () => {
            const user = await app.login();
            const user2 = await app.factory.create('users');
            await app.factory.create('favorites', {
                userId: user.id,
                objectId: user2.id,
                objectType: 0,
            });
            const result = await app
                .httpRequest()
                .get('/api/v0/favorites/exist')
                .set('Authorization', `Bearer ${user.token}`)
                .query({
                    objectId: user2.id,
                    objectType: 0,
                })
                .expect(200)
                .then(res => res.body);
            assert(result === true);
        });
    });

    describe('# GET /favorites', () => {
        it('## get favorite users', async () => {
            // 获取关注的人
            const user = await app.factory.create('users');
            const user2 = await app.factory.create('users');
            await app.factory.create('favorites', {
                userId: user.id,
                objectId: user2.id,
                objectType: 0,
            });
            const result = await app
                .httpRequest()
                .get('/api/v0/favorites')
                .query({
                    userId: user.id,
                    objectType: 0,
                })
                .expect(200)
                .then(res => res.body);
            assert(result[0].id === user2.id);
        });
        it('## get favorite sites', async () => {
            // 获取收藏的站点
            const loginUser = await app.login();
            const site = await app.factory.create('sites');
            await app.factory.create('favorites', {
                userId: loginUser.id,
                objectType: 1,
                objectId: site.id,
            });
            const result = await app
                .httpRequest()
                .get('/api/v0/favorites')
                .set('Authorization', `Bearer ${loginUser.token}`)
                .query({
                    userId: loginUser.id,
                    objectType: 1,
                })
                .expect(200)
                .then(res => res.body);
            assert(result[0].id === site.id);
        });

        it('## get favorite projects', async () => {
            // 获取收藏的项目
            const user = await app.login();
            const project = await app.factory.create('projects');
            await app.factory.create('favorites', {
                userId: user.id,
                objectId: project.id,
                objectType: 5,
            });
            const result = await app
                .httpRequest()
                .get('/api/v0/favorites')
                .set('Authorization', `Bearer ${user.token}`)
                .query({
                    objectType: 5,
                    userId: user.id,
                })
                .expect(200)
                .then(res => res.body);
            assert(result[0].projects.id === project.id);
        });
    });
});
