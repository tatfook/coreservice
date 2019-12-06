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
});
