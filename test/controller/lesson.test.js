const { app, assert } = require('egg-mock/bootstrap');
const apiKey = 'cda5ab42f101e9f739156e532f54db0d';

describe('test/controller/lesson.test.js', async () => {
    describe('/lessons/userProjectCount', async () => {
        let userIds = [];
        beforeEach(async () => {
            const ranks = await app.factory.createMany('userRanks', 10);
            userIds = ranks.map(r => r.userId);
        });

        it('001', async () => {
            const ret = await app
                .httpRequest()
                .get('/api/v0/lessons/userProjectCount')
                .send({
                    userIds,
                    apiKey,
                })
                .expect(200)
                .then(r => r.body);
            assert(ret.length === userIds.length);
        });

        it('002 apiKey缺失', async () => {
            await app
                .httpRequest()
                .get('/api/v0/lessons/userProjectCount')
                .send({
                    userIds,
                })
                .expect(400);
        });

        it('003 userIds错误', async () => {
            await app
                .httpRequest()
                .get('/api/v0/lessons/userProjectCount')
                .send({
                    userIds: 'abc',
                    apiKey,
                })
                .expect(422);
        });
        it('004 apiKey错误', async () => {
            await app
                .httpRequest()
                .get('/api/v0/lessons/userProjectCount')
                .send({
                    userIds: 'abc',
                    apiKey: { abc: 'abc' },
                })
                .expect(422);
        });
    });
});
