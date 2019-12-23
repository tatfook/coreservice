const { app, assert } = require('egg-mock/bootstrap');

describe('test/controller/game.test.js', () => {
    describe('# GET /games/projects', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .get('/api/v0/games/projects')
                .expect(401);
        });

        it('## success', async () => {
            const user = await app.login();
            const project = await app.factory.create('projects', {}, { user });
            await app
                .httpRequest()
                .get('/api/v0/games/projects')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => {
                    const data = res.body;
                    assert(data[0].id === project.id);
                });
        });
    });

    describe('# GET /games/members', () => {
        it('## no query params', async () => {
            await app
                .httpRequest()
                .get('/api/v0/games/members')
                .expect(200);
        });

        it('## bad request', async () => {
            await app
                .httpRequest()
                .get('/api/v0/games/members')
                .query({
                    gameNo: 'aa',
                })
                .expect(422);
        });

        it('## with query params', async () => {
            const user = await app.factory.create('users');
            const game = await app.factory.create('games', { no: 1 });
            const userinfo = await app.factory.create(
                'userinfos',
                {},
                { user }
            );
            await app.factory.create('gameWorks', {}, { user, game });
            await app
                .httpRequest()
                .get('/api/v0/games/members')
                .query({
                    gameNo: game.no,
                    gameName: game.name,
                    name: userinfo.name,
                    cellphone: user.cellphone,
                })
                .expect(200)
                .then(res => {
                    const data = res.body;
                    assert(data.total === 1);
                });
        });
    });

    describe('# POST /games/search', () => {
        it('## success', async () => {
            const user = await app.factory.create('users');
            const game = await app.factory.create('games');
            await app.factory.create('userinfos', {}, { user });
            await app.factory.create('gameWorks', {}, { user, game });
            await app
                .httpRequest()
                .post('/api/v0/games/search')
                .expect(200)
                .then(res => {
                    assert(res.body.count);
                });
        });
    });
});
