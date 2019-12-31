const { app } = require('egg-mock/bootstrap');

describe('test/controller/trade.test.js', () => {
    describe('# POST /trades/search', () => {
        it.only('## success', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/trades/search')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200);
        });
    });

    describe('# POST /trades', () => {
        it.only('## unauthorized', async () => {
            await app
                .httpRequest()
                .post('/api/v0/trades')
                .expect(401);
        });

        it.only('## bad request', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/trades')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(422);
        });

        it.only('## count 为10的整数倍', async () => {
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

        it.only('## goods not found', async () => {
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
    });
});
