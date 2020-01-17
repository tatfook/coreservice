const { app, assert } = require('egg-mock/bootstrap');

describe('test/controller/oauthApp.test.js', () => {
    describe('# GET /oauth_apps/oauth_code', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .get('/api/v0/oauth_apps/oauth_code')
                .expect(401);
        });

        it('## bad request', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .get('/api/v0/oauth_apps/oauth_code')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(422);
        });

        it('## app not found', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .get('/api/v0/oauth_apps/oauth_code')
                .set('Authorization', `Bearer ${user.token}`)
                .query({
                    client_id: '123',
                    state: '123456',
                })
                .expect(400)
                .then(({ body }) => {
                    assert(body.code === 1);
                });
        });

        it('## success', async () => {
            const user = await app.login();
            await app.model.oauthApps.create({
                appName: 'test',
                clientId: '123',
            });
            await app
                .httpRequest()
                .get('/api/v0/oauth_apps/oauth_code')
                .set('Authorization', `Bearer ${user.token}`)
                .query({
                    client_id: '123',
                    state: '123456',
                })
                .expect(200)
                .then(({ body }) => {
                    assert(body.state === '123456' && body.code);
                });
        });
    });

    describe('# POST /oauth_apps/oauth_token', () => {
        it('## bad request', async () => {
            await app
                .httpRequest()
                .post('/api/v0/oauth_apps/oauth_token')
                .expect(422);
        });

        it('## invalid code', async () => {
            await app
                .httpRequest()
                .post('/api/v0/oauth_apps/oauth_token')
                .send({
                    client_id: '123',
                    code: '1234',
                    client_secret: '123456',
                })
                .expect(400)
                .then(({ body }) => {
                    assert(body.code === 2);
                });
        });

        it('## wrong clientSecret', async () => {
            const oauthApp = await app.model.oauthApps.create({
                appName: 'test',
                clientId: '123',
                clientSecret: '123456',
            });
            let code;
            const user = await app.login();
            await app
                .httpRequest()
                .get('/api/v0/oauth_apps/oauth_code')
                .set('Authorization', `Bearer ${user.token}`)
                .query({
                    client_id: oauthApp.clientId,
                    state: '123456',
                })
                .expect(200)
                .then(({ body }) => {
                    assert(body.state === '123456' && body.code);
                    code = body.code;
                });
            await app
                .httpRequest()
                .post('/api/v0/oauth_apps/oauth_token')
                .send({
                    client_id: oauthApp.clientId,
                    code,
                    client_secret: oauthApp.clientSecret + '999',
                })
                .expect(400)
                .then(({ body }) => {
                    assert(body.code === 3);
                });
        });

        it('## success', async () => {
            const oauthApp = await app.model.oauthApps.create({
                appName: 'test',
                clientId: '123',
                clientSecret: '123456',
            });
            let code;
            const user = await app.login();
            await app
                .httpRequest()
                .get('/api/v0/oauth_apps/oauth_code')
                .set('Authorization', `Bearer ${user.token}`)
                .query({
                    client_id: oauthApp.clientId,
                    state: '123456',
                })
                .expect(200)
                .then(({ body }) => {
                    assert(body.state === '123456' && body.code);
                    code = body.code;
                });
            await app
                .httpRequest()
                .post('/api/v0/oauth_apps/oauth_token')
                .send({
                    client_id: oauthApp.clientId,
                    code,
                    client_secret: oauthApp.clientSecret,
                })
                .expect(200)
                .then(({ body }) => {
                    assert(body.token);
                });
        });
    });

    describe('# POST /oauth_apps/login', () => {
        it('## bad request', async () => {
            await app
                .httpRequest()
                .post('/api/v0/oauth_apps/login')
                .expect(422);
        });

        it('## username or password wrong', async () => {
            const user = await app.login({ username: 'test' });
            await app
                .httpRequest()
                .post('/api/v0/oauth_apps/login')
                .send({
                    username: user.username,
                    password: '123456789',
                })
                .expect(400)
                .then(({ body }) => {
                    assert(body.code === 1);
                });
        });

        it('## success', async () => {
            const user = await app.login({ username: 'test' });
            await app
                .httpRequest()
                .post('/api/v0/oauth_apps/login')
                .send({
                    username: user.username,
                    password: '123456',
                })
                .expect(200)
                .then(({ body }) => {
                    assert(body.token && body.user);
                });
        });
    });
});
