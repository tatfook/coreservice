const { app, assert, mock } = require('egg-mock/bootstrap');

describe('test/controller/oauthUser.test.js', () => {
    describe('# POST /oauth_users/qq', () => {
        beforeEach(() => {
            mock(require('axios'), 'get', async function(url) {
                switch (url) {
                case 'https://graph.qq.com/oauth2.0/token':
                    return {
                        data:
                                'access_token=FE04************************CCE2&expires_in=7776000&refresh_token=88E4************************BE14',
                    };
                case 'https://graph.qq.com/oauth2.0/me':
                    return {
                        data:
                                'callback( {"client_id":"YOUR_APPID","openid":"YOUR_OPENID"} ); ',
                    };
                case 'https://graph.qq.com/user/get_user_info':
                    return {
                        data: {
                            ret: 0,
                            msg: '',
                            nickname: 'Peter',
                            figureurl:
                                    'http://qzapp.qlogo.cn/qzapp/111111/942FEA70050EEAFBD4DCE2C1FC775E56/30',
                            figureurl_1:
                                    'http://qzapp.qlogo.cn/qzapp/111111/942FEA70050EEAFBD4DCE2C1FC775E56/50',
                            figureurl_2:
                                    'http://qzapp.qlogo.cn/qzapp/111111/942FEA70050EEAFBD4DCE2C1FC775E56/100',
                            figureurl_qq_1:
                                    'http://q.qlogo.cn/qqapp/100312990/DE1931D5330620DBD07FB4A5422917B6/40',
                            figureurl_qq_2:
                                    'http://q.qlogo.cn/qqapp/100312990/DE1931D5330620DBD07FB4A5422917B6/100',
                            gender: '男',
                            is_yellow_vip: '1',
                            vip: '1',
                            yellow_vip_level: '7',
                            level: '7',
                            is_yellow_year_vip: '1',
                        },
                    };

                default:
                    break;
                }
            });
        });

        it('## bad request', async () => {
            await app
                .httpRequest()
                .post('/api/v0/oauth_users/qq')
                .expect(422);
        });

        it('## no userId and no oauth before', async () => {
            await app
                .httpRequest()
                .post('/api/v0/oauth_users/qq')
                .send({
                    clientId: 'test',
                    code: 'test',
                    redirectUri: 'redirectUri',
                    state: 'state',
                })
                .expect(200);
            const oauth = await app.model.oauthUsers.findOne();
            assert(oauth.externalUsername === 'Peter');
            assert(!oauth.userId);
        });

        it('## should throw error when qq already is bound', async () => {
            await app.model.oauthUsers.create({
                userId: 100,
                externalId: 'YOUR_OPENID',
                type: 0,
            });
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/oauth_users/qq')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    clientId: 'test',
                    code: 'test',
                    redirectUri: 'redirectUri',
                    state: 'state',
                })
                .expect(400)
                .then(res => {
                    const { body } = res;
                    assert(body.code === 21);
                });
        });

        it('## login with qq with user exist', async () => {
            const user = await app.factory.create('users');
            await app.model.oauthUsers.create({
                userId: user.id,
                externalId: 'YOUR_OPENID',
                type: 0,
            });
            await app
                .httpRequest()
                .post('/api/v0/oauth_users/qq')
                .send({
                    clientId: 'test',
                    code: 'test',
                    redirectUri: 'redirectUri',
                    state: 'login',
                })
                .expect(200)
                .then(res => {
                    const { body, header } = res;
                    assert(header['set-cookie']);
                    assert(body.id === user.id && body.token);
                });
        });

        it('## login with qq with user not exist', async () => {
            await app
                .httpRequest()
                .post('/api/v0/oauth_users/qq')
                .send({
                    clientId: 'test',
                    code: 'test',
                    redirectUri: 'redirectUri',
                    state: 'login',
                })
                .expect(200)
                .then(res => {
                    const { body } = res;
                    assert(body.token);
                });
            const oauth = await app.model.oauthUsers.findOne();
            assert(oauth);
        });

        it('## bind qq', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/oauth_users/qq')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    clientId: 'test',
                    code: 'test',
                    redirectUri: 'redirectUri',
                    state: 'bind',
                })
                .expect(200)
                .then(res => {
                    const { body } = res;
                    assert(body.token);
                });
        });
    });

    describe('# POST /oauth_users/weixin', () => {
        beforeEach('mock serivce', () => {
            mock(require('axios'), 'get', async function(url) {
                switch (url) {
                case 'https://api.weixin.qq.com/sns/oauth2/access_token':
                    return {
                        data: {
                            access_token: 'mock_access_token',
                            openid: 'mock_openid',
                        },
                    };
                case 'https://api.weixin.qq.com/sns/userinfo':
                    return {
                        data: {
                            nickname: 'testweixin',
                        },
                    };

                default:
                    break;
                }
            });
        });

        it('## weixin login bad request', async () => {
            await app
                .httpRequest()
                .post('/api/v0/oauth_users/weixin')
                .expect(422);
        });

        it('## weixin login successfully', async () => {
            await app
                .httpRequest()
                .post('/api/v0/oauth_users/weixin')
                .send({
                    clientId: 'test',
                    code: 'test',
                    redirectUri: 'redirectUri',
                    state: 'bind',
                })
                .expect(200);
        });
    });

    describe('# POST /oauth_users/github', () => {
        beforeEach('mock serivce', () => {
            mock(require('axios'), 'get', async function(url) {
                switch (url) {
                case 'https://github.com/login/oauth/access_token':
                    return {
                        data:
                                'access_token=aa035971e9864642500a7aaad8783c59c8111228&scope=user%3Aemail&token_type=bearer',
                    };
                case 'https://api.github.com/user':
                    return {
                        data: { id: '11922085', login: 'wxaxiaoyao' },
                    };

                default:
                    break;
                }
            });
        });

        it('## github login bad request', async () => {
            await app
                .httpRequest()
                .post('/api/v0/oauth_users/github')
                .expect(422);
        });

        it('## github login successfully', async () => {
            await app
                .httpRequest()
                .post('/api/v0/oauth_users/github')
                .send({
                    clientId: 'test',
                    code: 'test',
                    redirectUri: 'redirectUri',
                    state: 'bind',
                })
                .expect(200);
        });
    });

    describe('# POST /oauth_users/xinlang', () => {
        beforeEach('mock serivce', () => {
            mock(require('axios'), 'post', async function(url) {
                if (
                    url.indexOf('https://api.weibo.com/oauth2/access_token') !==
                    -1
                ) {
                    return {
                        data: {
                            access_token: 'xinlang_token',
                            uid: 'uid',
                        },
                    };
                }
            });
            mock(require('axios'), 'get', async function(url) {
                if (
                    url.indexOf('https://api.weibo.com/2/users/show.json') !==
                    -1
                ) {
                    return {
                        data: { screen_name: 'wxaxiaoyao' },
                    };
                }
            });
        });

        it('## xinlang login bad request', async () => {
            await app
                .httpRequest()
                .post('/api/v0/oauth_users/xinlang')
                .expect(422);
        });

        it('## xinlang login successfully', async () => {
            await app
                .httpRequest()
                .post('/api/v0/oauth_users/xinlang')
                .send({
                    clientId: 'test',
                    code: 'test',
                    redirectUri: 'redirectUri',
                    state: 'bind',
                })
                .expect(200);
        });
    });

    describe('# DELETE /oauth_users/:id', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .del('/api/v0/oauth_users/1')
                .expect(401);
        });

        it('## bad request', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .del('/api/v0/oauth_users/1')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(422);
        });

        it('## wrong password', async () => {
            const user = await app.login({ password: 12345 });
            await app
                .httpRequest()
                .del('/api/v0/oauth_users/1')
                .set('Authorization', `Bearer ${user.token}`)
                .query({
                    password: '12345678',
                })
                .expect(400)
                .then(({ body }) => {
                    assert(body.code === 11);
                });
        });

        it('## delete successfully', async () => {
            const user = await app.login();
            const oauth = await app.model.oauthUsers.create({
                externalUsername: 'test',
                externalId: 'test',
                userId: user.id,
                type: 0,
            });
            await app
                .httpRequest()
                .del(`/api/v0/oauth_users/${oauth.id}`)
                .set('Authorization', `Bearer ${user.token}`)
                .query({
                    password: '123456',
                })
                .expect(200)
                .then(({ text }) => {
                    assert(text === 'OK');
                });

            assert(!(await app.model.oauthUsers.findOne()));
        });
    });

    describe('# GET /oauth_users', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .get('/api/v0/oauth_users')
                .expect(401);
        });

        it('## success', async () => {
            const user = await app.login();
            await app.model.oauthUsers.create({
                userId: user.id,
                externalId: 'YOUR_OPENID',
                type: 0,
            });
            await app
                .httpRequest()
                .get('/api/v0/oauth_users')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(({ body }) => {
                    assert(body[0]);
                });
        });
    });
});
