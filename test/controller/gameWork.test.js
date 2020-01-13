const { app, assert } = require('egg-mock/bootstrap');

describe('test/controller/gameWork.test.js', () => {
    describe('# GET /gameWorks/statistics', () => {
        it('## successfully', async () => {
            const user = await app.factory.create('users');
            const game = await app.factory.create('games');
            await app.factory.create('userinfos', {}, { user });
            await app.factory.create('gameWorks', { win: 1 }, { user, game });
            await app
                .httpRequest()
                .get('/api/v0/gameWorks/statistics')
                .expect(200)
                .then(res => {
                    const data = res.body;
                    assert(data.list && data.winlist);
                });
        });
    });

    describe('# POST /gameWorks/search', () => {
        it('## successfully', async () => {
            const user = await app.factory.create('users');
            const game = await app.factory.create('games');
            await app.factory.create('userinfos', {}, { user });
            await app.factory.create('gameWorks', { win: 1 }, { user, game });
            await app
                .httpRequest()
                .post('/api/v0/gameWorks/search')
                .expect(200)
                .then(res => {
                    assert(res.body.count);
                    assert(res.body.rows[0].projects);
                });
        });

        it('## with gameName', async () => {
            const user = await app.factory.create('users');
            const game = await app.factory.create('games');
            await app.factory.create('userinfos', {}, { user });
            await app.factory.create('gameWorks', { win: 1 }, { user, game });
            await app
                .httpRequest()
                .post('/api/v0/gameWorks/search')
                .query({
                    gameName: game.name,
                })
                .expect(200)
                .then(res => {
                    assert(res.body.count);
                    assert(res.body.rows[0].projects);
                });
        });

        it('## with project deleted', async () => {
            const user = await app.factory.create('users');
            const game = await app.factory.create('games');
            const project = await app.factory.create('projects');
            await app.factory.create('userinfos', {}, { user });
            await app.factory.create(
                'gameWorks',
                { win: 1 },
                { user, project, game }
            );
            await app.model.projects.destroy({ where: { id: project.id } });
            await app
                .httpRequest()
                .post('/api/v0/gameWorks/search')
                .query({
                    gameName: game.name,
                })
                .expect(200)
                .then(res => {
                    assert(res.body.count);
                    assert(!res.body.rows[0].projects);
                });
        });
    });

    describe('# POST /gameWorks/snapshoot', () => {
        it('## successfully', async () => {
            const user = await app.factory.create('users');
            const game = await app.factory.create('games');
            const project = await app.factory.create('projects');
            await app.factory.create('userinfos', {}, { user });
            const gamework = await app.factory.create(
                'gameWorks',
                { win: 1 },
                { user, project, game }
            );

            await app
                .httpRequest()
                .post('/api/v0/gameWorks/snapshoot')
                .expect(200);

            await app
                .httpRequest()
                .post('/api/v0/gameWorks/snapshoot')
                .send({
                    ids: [gamework.id],
                })
                .expect(200);

            await app.model.projects.destroy({ where: { id: project.id } });

            await app
                .httpRequest()
                .post('/api/v0/gameWorks/snapshoot')
                .send({
                    ids: [gamework.id],
                })
                .expect(200);
        });
    });

    describe('# GET /gameWorks', () => {
        it('## successfully', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .get('/api/v0/gameWorks')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200);
        });
    });
});
