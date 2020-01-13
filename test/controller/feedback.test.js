const { assert, app } = require('egg-mock/bootstrap');

describe('test/controller/feedback.test.js', () => {
    describe('# POST /feedbacks', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .post('/api/v0/feedbacks')
                .expect(401);
        });

        it('## bad request', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/feedbacks')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    url: 'www.baidu.com',
                    type: 10,
                    description: 'test',
                })
                .expect(422);
        });

        it('## success', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/feedbacks')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    url: 'www.baidu.com',
                    handle: 10,
                })
                .expect(200)
                .then(res => {
                    const feedback = res.body;
                    assert(feedback.handle === 0);
                    assert(feedback.type === 0);
                    assert(feedback.url === 'www.baidu.com');
                });
        });
    });
});
