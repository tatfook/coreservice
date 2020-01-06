const { app, assert } = require('egg-mock/bootstrap');

describe('test/controller/domain.test.js', () => {
    describe('# GET /domains/exist', () => {
        it('## bad request', async () => {
            await app
                .httpRequest()
                .get('/api/v0/domains/exist')
                .expect(422);
        });

        it('## success', async () => {
            const url = 'http://www.baidu.com';
            await app
                .httpRequest()
                .get('/api/v0/domains/exist')
                .query({
                    domain: url,
                })
                .expect(200)
                .then(res => {
                    assert(!res.body);
                });
            await app.model.domains.create({
                domain: url,
                userId: 1,
                siteId: 1,
            });
            await app
                .httpRequest()
                .get(`/api/v0/domains/exist?domain=${encodeURIComponent(url)}`)
                .expect(200)
                .then(res => {
                    assert(res.body);
                });
        });
    });

    describe('# GET /domains/:id', () => {
        it('## getById', async () => {
            const url = 'http://www.baidu.com';
            await app
                .httpRequest()
                .get('/api/v0/domains/1')
                .expect(200);

            const user = await app.factory.create('users');
            const site = await app.factory.create('sites');
            const domain = await app.model.domains.create({
                domain: url,
                userId: user.id,
                siteId: site.id,
            });
            await app
                .httpRequest()
                .get(`/api/v0/domains/${domain.id}`)
                .expect(200);
        });

        it('## getByDomain', async () => {
            const url = 'http://www.baidu.com';
            await app
                .httpRequest()
                .get(`/api/v0/domains/${encodeURIComponent(url)}`)
                .expect(200);

            const user = await app.factory.create('users');
            const site = await app.factory.create('sites');
            await app.model.domains.create({
                domain: url,
                userId: user.id,
                siteId: site.id,
            });
            await app
                .httpRequest()
                .get(`/api/v0/domains/${encodeURIComponent(url)}`)
                .expect(200);
        });
    });

    describe('# GET /domains', () => {
        it('## success', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .get('/api/v0/domains')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200);
        });
    });
});
