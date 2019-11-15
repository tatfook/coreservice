const md5 = require('blueimp-md5');
const { app, mock, assert } = require('egg-mock/bootstrap');

describe('七牛', () => {
    before(async () => {});

    it('001 文件上传', async () => {
        const token = await app.login().then(o => o.token);

        const uploadToken = await app
            .httpRequest()
            .get('/api/v0/qinius/uploadToken')
            .set('Authorization', `Bearer ${token}`)
            .expect(res => assert(res.statusCode == 200))
            .then(res => res.text);
        assert(uploadToken);

        const data = await app
            .httpRequest()
            .post('/api/v0/qinius/uploadCallback')
            .send({ key: 'test.png' })
            .expect(res => assert(res.statusCode == 200))
            .then(res => res.body);
        assert(data.url);
    });
});
