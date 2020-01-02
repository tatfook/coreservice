const { app, assert, mock } = require('egg-mock/bootstrap');

describe('test/controller/trade.test.js', () => {
    describe('# POST /trades/search', () => {
        it('## success', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/trades/search')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200);
        });
    });

    describe('# POST /trades', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .post('/api/v0/trades')
                .expect(401);
        });

        it('## bad request', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/trades')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(422);
        });

        it('## count 为10的整数倍', async () => {
            const user = await app.login();
            // count 为10的整数倍
            await app
                .httpRequest()
                .post('/api/v0/trades')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    type: 1,
                    goodsId: 1,
                    count: 12,
                })
                .expect(400);

            await app
                .httpRequest()
                .post('/api/v0/trades')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    type: 1,
                    goodsId: 1,
                    count: 9,
                })
                .expect(400);
        });

        it('## goods not found', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/trades')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    type: 1,
                    goodsId: 1,
                    count: 400,
                })
                .expect(400);
        });

        it('## account not found', async () => {
            const user = await app.login();
            const good = await app.model.goods.create({
                platform: 2,
                callback: 'http://192.168.15.148:56888/HttpPayHandle.lua',
                rmb: 0.0,
                coin: 0,
                bean: 70,
            });
            await app
                .httpRequest()
                .post('/api/v0/trades')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    type: 1,
                    goodsId: good.id,
                    count: 400,
                })
                .expect(500);
        });

        it('## account not enough', async () => {
            const user = await app.login();
            const good = await app.model.goods.create({
                platform: 2,
                callback: 'http://192.168.15.148:56888/HttpPayHandle.lua',
                rmb: 0.0,
                coin: 0,
                bean: 70,
            });
            await app.model.accounts.create({
                userId: user.id,
                bean: 600,
            });
            await app
                .httpRequest()
                .post('/api/v0/trades')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    type: 1,
                    goodsId: good.id,
                    count: 10,
                })
                .expect(400)
                .then(res => {
                    assert(res.body.code === 13);
                });
        });

        it('## account not enough', async () => {
            const user = await app.login();
            const good = await app.model.goods.create({
                platform: 2,
                callback: 'http://192.168.15.148:56888/HttpPayHandle.lua',
                rmb: 0.0,
                coin: 0,
                bean: 70,
            });
            await app.model.accounts.create({
                userId: user.id,
                bean: 600,
            });
            await app
                .httpRequest()
                .post('/api/v0/trades')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    type: 1,
                    goodsId: good.id,
                    count: 10,
                })
                .expect(400)
                .then(res => {
                    assert(res.body.code === 13);
                });
        });

        it('## success', async () => {
            const axios = require('axios');
            mock(axios, 'get', function() {
                return new Promise(function(resolve) {
                    resolve({ data: ',result=0,' });
                });
            });
            mock(axios, 'post', function() {
                return new Promise(function(resolve) {
                    resolve();
                });
            });
            const user = await app.login();
            const good = await app.model.goods.create({
                platform: 2,
                callback: 'http://192.168.15.148:56888/HttpPayHandle.lua',
                rmb: 0.0,
                coin: 0,
                bean: 70,
            });
            await app.model.accounts.create({
                userId: user.id,
                bean: 700,
            });
            await app
                .httpRequest()
                .post('/api/v0/trades')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    type: 1,
                    goodsId: good.id,
                    count: 10,
                })
                .expect(200);
        });
    });
});
