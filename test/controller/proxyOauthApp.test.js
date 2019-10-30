const axios = require('axios');
const md5 = require('blueimp-md5');

const { app, mock, assert } = require('egg-mock/bootstrap');

describe('旧第三方程序登录', () => {
    before(async () => {});

    it.skip('OAUTH LOGIN', async () => {
        const apiUrlPrefix = 'https://keepwork.com/api/wiki/models/';

        // 登录
        const token = await axios
            .post(`${apiUrlPrefix}user/login`, {
                username: 'wxatest',
                password: 'wuxiangan',
            })
            .then(res => res.data.data.token);
        //console.log(token);
        assert(token);

        // 获取认证码
        const code = await axios
            .post(
                `${apiUrlPrefix}oauth_app/agreeOauth`,
                { client_id: '123456' },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then(res => res.data.data.code);
        //console.log(code);
        assert(code);

        // 通过认证码获取token
        const auth_token = await axios
            .post(`${apiUrlPrefix}oauth_app/getTokenByCode`, {
                client_id: '123456',
                code,
                client_secret: 'abcdef',
            })
            .then(res => res.data.token);
        //console.log(auth_token);
        assert(auth_token);

        // 验证认证token
        const profile = await axios
            .get(`${apiUrlPrefix}user/getProfile`, {
                headers: { Authorization: `Bearer ${auth_token}` },
            })
            .then(res => res.data.data);
        //console.log(profile);
        assert(profile);
    });
});
