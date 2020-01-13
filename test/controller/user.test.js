const { app, mock, assert } = require('egg-mock/bootstrap');
const _ = require('lodash');
const Base64 = require('js-base64').Base64;
const {
    ENTITY_TYPE_GROUP,
    USER_ACCESS_LEVEL_WRITE,
} = require('../../app/core/consts');
describe('test/controller/user.test.js', () => {
    describe('# GET /users/rank', () => {
        it('## get users by rank successfully', async () => {
            await app.factory.createMany('userRanks', 100);
            await app.factory.createMany('users', 100);
            const ranks = await app.model.userRanks.findAll();
            const users = await app.model.users.findAll();
            assert(ranks.length === users.length);
            const result = await app
                .httpRequest()
                .get('/api/v0/users/rank')
                .set('x-order', 'fans-desc')
                .set('x-per-page', 10)
                .expect(200)
                .then(res => res.body);
            assert(Array.isArray(result));
            assert(result.length === 10);
            assert(result[0].username !== undefined);
            assert(result[0].userId !== undefined);
            assert(result[0].nickname !== undefined);
            assert(result[0].portrait !== undefined);
            assert(result[0].description !== undefined);
            const userRank = await app.model.userRanks.findOne({
                where: { fans: 100 },
            });
            assert(result[0].userId === userRank.userId);
        });
    });

    describe('# POST /users/platform_login', () => {
        beforeEach('mock service', () => {
            mock(require('axios'), 'post', () => {
                return {
                    then: () => {
                        return {
                            data: {
                                status: 0,
                                user_info: {
                                    nickname: 'helloqq',
                                    figureurl: 'http://www.baidu.com',
                                },
                            },
                        };
                    },
                };
            });
        });
        // qq游戏大厅登录
        it('## bad request', async () => {
            await app
                .httpRequest()
                .post('/api/v0/users/platform_login')
                .expect(400);
        });

        it('## bad platform', async () => {
            await app
                .httpRequest()
                .post('/api/v0/users/platform_login')
                .send({
                    uid: '1123',
                    token: 'token',
                    platform: 'qq',
                })
                .expect(400);
        });

        it('## 平台登录网络请求失败', async () => {
            mock(require('axios'), 'post', () => {
                return {
                    then: () => {
                        throw new Error();
                    },
                };
            });
            const result = await app
                .httpRequest()
                .post('/api/v0/users/platform_login')
                .send({
                    uid: '1123',
                    token: 'token',
                    platform: 'qqHall',
                })
                .expect(400)
                .then(res => res.text);
            assert(result.indexOf('平台登录失败') !== -1);
        });

        it('## 平台登录状态失败', async () => {
            mock(require('axios'), 'post', () => {
                return {
                    then: () => {
                        return {
                            data: {
                                status: 1,
                                user_info: {
                                    nickname: 'helloqq',
                                    figureurl: 'http://www.baidu.com',
                                },
                            },
                        };
                    },
                };
            });
            const result = await app
                .httpRequest()
                .post('/api/v0/users/platform_login')
                .send({
                    uid: '1123',
                    token: 'token',
                    platform: 'qqHall',
                })
                .expect(400)
                .then(res => res.text);
            assert(result.indexOf('平台登录失败') !== -1);
        });

        it('## oauthUser and user exist', async () => {
            await app.model.oauthUsers.create({
                externalId: '123456',
                type: 4,
                userId: 1,
            });
            await app.factory.create('users');
            const result = await app
                .httpRequest()
                .post('/api/v0/users/platform_login')
                .send({
                    uid: '123456',
                    token: 'token',
                    platform: 'qqHall',
                })
                .expect(200)
                .then(res => res.body);
            assert(result.kp.user.id === 1);
        });

        it('## oauthUser and user not exist', async () => {
            const result = await app
                .httpRequest()
                .post('/api/v0/users/platform_login')
                .send({
                    uid: '123456',
                    token: 'token',
                    platform: 'qqHall',
                })
                .expect(200)
                .then(res => res.body);
            assert(result.kp.user.id === 1);
            assert(result.kp.user.channel === 4);
            const oauth = await app.model.oauthUsers.findOne();
            assert(oauth);
        });
    });

    describe('# POST /users/search', () => {
        it('## search user by id', async () => {
            await app.factory.createMany('users', 10);
            const result = await app
                .httpRequest()
                .post('/api/v0/users/search')
                .send({
                    id: 1,
                })
                .expect(200)
                .then(res => res.body);
            assert(result.count === 1);
            assert(result.rows.length === 1);
            assert(result.rows[0]);
        });

        it('## search user failed', async () => {
            await app.factory.createMany('users', 10);
            await app
                .httpRequest()
                .post('/api/v0/users/search')
                .send({
                    _id: 1,
                })
                .expect(500);
        });
    });

    describe('# POST /users/:id/contributions', () => {
        it('## add users contributions successfully', async () => {
            const { token } = await app.login();
            await app.model.contributions.create({
                userId: 1,
                year: new Date().getFullYear(),
                data: {},
            });
            await app
                .httpRequest()
                .post('/api/v0/users/1/contributions')
                .send({
                    count: 2,
                })
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            const userRank = await app.model.userRanks.findOne({
                where: { id: 1 },
            });
            assert(userRank.active === 2);
            const contribution = await app.model.contributions.findOne({
                where: { userId: 1 },
            });
            assert(!_.isEmpty(contribution.data));
        });

        it('## add users contributions not exist before successfully', async () => {
            const { token } = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/users/1/contributions')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            const userRank = await app.model.userRanks.findOne({
                where: { id: 1 },
            });
            assert(userRank.active === 1);
            const contribution = await app.model.contributions.findOne({
                where: { userId: 1 },
            });
            assert(contribution && !_.isEmpty(contribution.data));
        });

        it('## add users contributions failed 401', async () => {
            await app
                .httpRequest()
                .post('/api/v0/users/1/contributions')
                .expect(401);
        });
    });

    describe('# GET /users/:id/contributions', () => {
        it('## get contributions successfully', async () => {
            await app.model.contributions.create({
                userId: 1,
                year: new Date().getFullYear(),
                data: { '2019-11-21': 1 },
            });
            await app.model.contributions.create({
                userId: 1,
                year: new Date().getFullYear() - 1,
                data: { '2018-11-21': 1 },
            });
            await app.model.contributions.create({
                userId: 1,
                year: new Date().getFullYear() - 2,
                data: { '2017-11-21': 1 },
            });
            const result = await app
                .httpRequest()
                .get('/api/v0/users/1/contributions')
                .expect(200)
                .then(res => res.body);
            assert(_.isEqual(result, { '2019-11-21': 1, '2018-11-21': 1 }));
        });

        it('## get contributions bad request', async () => {
            await app
                .httpRequest()
                .get('/api/v0/users/aa/contributions')
                .expect(400);
        });
    });

    describe('# GET /users/:id/detail', () => {
        it('## get the detail of users successfully', async () => {
            // 创建数据
            const user = { id: 1, username: 'test' };
            await app.factory.create('users', user);
            await app.model.contributions.create({
                userId: 1,
                year: new Date().getFullYear(),
                data: { '2019-11-21': 1 },
            });

            const id = Base64.encode(JSON.stringify(user));
            const result = await app
                .httpRequest()
                .get(`/api/v0/users/id${id}/detail`)
                .expect(200)
                .then(res => res.body);
            assert(result.username === user.username);
            assert(_.isEqual(result.contributions, { '2019-11-21': 1 }));
            assert(!_.isEmpty(result.rank));
        });

        it('## get the detail of not exist user bad request', async () => {
            // 创建数据
            const user = { id: 1, username: 'test' };
            await app.factory.create('users', user);
            await app.model.contributions.create({
                userId: 1,
                year: new Date().getFullYear(),
                data: { '2019-11-21': 1 },
            });

            const id = Base64.encode(
                JSON.stringify({ id: 2, username: 'test2' })
            );
            await app
                .httpRequest()
                .get(`/api/v0/users/id${id}/detail`)
                .expect(400);
        });

        it('## get the detail of users illegal id bad request', async () => {
            await app
                .httpRequest()
                .get('/api/v0/users/id1/detail')
                .expect(400);
        });
    });

    describe('# GET /users/:id/sites', () => {
        it("## get users' sites successfully", async () => {
            await app.factory.create('sites', { userId: 1 });
            await app.factory.create('users');
            const result = await app
                .httpRequest()
                .get('/api/v0/users/1/sites')
                .expect(200)
                .then(res => res.body);
            assert(result.length === 1);
        });

        it("## get users' sites and joined sites successfully", async () => {
            await app.factory.create('sites', { userId: 1 });
            await app.factory.create('sites', { userId: 2 });
            await app.factory.createMany('users', 10);
            await app.model.members.create({
                userId: 2,
                objectType: ENTITY_TYPE_GROUP,
                objectId: 1,
                memberId: 1,
            });
            await app.model.siteGroups.create({
                userId: 2,
                siteId: 1,
                groupId: 1,
                level: USER_ACCESS_LEVEL_WRITE,
            });
            const result = await app
                .httpRequest()
                .get('/api/v0/users/1/sites')
                .expect(200)
                .then(res => res.body);
            assert(result.length === 2);
        });

        it("## get users' sites by username successfully", async () => {
            const user = await app.factory.create('users', {
                username: 'test',
            });
            await app.factory.create('sites', {}, { user });
            const result = await app
                .httpRequest()
                .get('/api/v0/users/test/sites')
                .expect(200)
                .then(res => res.body);
            assert(result.length === 1);
        });

        it("## can' find user bad request", async () => {
            await app.factory.create('sites', { userId: 1 });
            await app.factory.create('users', { username: 'test' });
            const result = await app
                .httpRequest()
                .get('/api/v0/users/test2/sites')
                .expect(200)
                .then(res => res.body);
            assert(result.length === 0);
        });
    });

    describe('# GET /users/token', () => {
        it('## get users token successfully', async () => {
            const { token } = await app.login({ username: 'test' });
            const result = await app
                .httpRequest()
                .get('/api/v0/users/token')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => res.text);
            assert(token !== result);
            const tokens = (await app.model.userdatas.findOne({
                where: { userId: 1 },
            })).data.tokens;
            assert(result === tokens.shift());
        });

        it('## get users token failed 401', async () => {
            await app
                .httpRequest()
                .get('/api/v0/users/token')
                .expect(401);
        });
    });

    describe('# GET /users/token/info', () => {
        it('## get token info successfully', async () => {
            const { token } = await app.login({ username: 'test' });
            const result = await app
                .httpRequest()
                .get('/api/v0/users/token/info')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => res.body);
            assert(result.username === 'test');
        });

        it('## get token info failed by mistake token', async () => {
            await app
                .httpRequest()
                .get('/api/v0/users/token/info')
                .set('Authorization', 'Bearer faketoken')
                .expect(401);
        });

        it('## get token info failed by no token', async () => {
            await app
                .httpRequest()
                .get('/api/v0/users/token/info')
                .expect(401);
        });
    });

    describe('# POST /users/register', () => {
        it('## register lack of params', async () => {
            await app
                .httpRequest()
                .post('/api/v0/users/register')
                .send({
                    username: 'test',
                })
                .expect(400);
        });

        it('## register failed username has ahocorasick', async () => {
            mock(app.ahocorasick, 'check', () => {
                return [1, 1, 1];
            });
            const result = await app
                .httpRequest()
                .post('/api/v0/users/register')
                .send({
                    username: 'test',
                    password: '123456',
                })
                .expect(400)
                .then(res => res.body);
            assert(result.message === '内容不合法,包含敏感词');
            assert(result.code === 8);
        });

        it('## register failed username invalidate', async () => {
            const result = await app
                .httpRequest()
                .post('/api/v0/users/register')
                .send({
                    username: '123test',
                    password: '123456',
                })
                .expect(400)
                .then(res => res.body);
            assert(result.message === '用户名不合法');
            assert(result.code === 2);
        });

        it('## register failed username already exists', async () => {
            await app.factory.create('users', { username: 'test' });
            const result = await app
                .httpRequest()
                .post('/api/v0/users/register')
                .send({
                    username: 'test',
                    password: '123456',
                })
                .expect(400)
                .then(res => res.body);
            assert(result.message === '用户已存在');
            assert(result.code === 3);
        });

        it('## register failed username is an illegal user', async () => {
            await app.model.illegalUsers.create({
                username: 'test',
                password: '123456',
            });
            const result = await app
                .httpRequest()
                .post('/api/v0/users/register')
                .send({
                    username: 'test',
                    password: '123456',
                })
                .expect(400)
                .then(res => res.body);
            assert(result.message === '用户已存在');
            assert(result.code === 3);
        });

        it('## register failed cellphone or email captcha expired', async () => {
            let result = await app
                .httpRequest()
                .post('/api/v0/users/register')
                .send({
                    username: 'test',
                    password: '123456',
                    cellphone: '13012456933',
                    captcha: '1234',
                })
                .expect(400)
                .then(res => res.body);
            assert(result.message === '验证码过期');
            assert(result.code === 4);
            result = await app
                .httpRequest()
                .post('/api/v0/users/register')
                .send({
                    username: 'test',
                    password: '123456',
                    email: '13012456933',
                    captcha: '1234',
                })
                .expect(400)
                .then(res => res.body);
            assert(result.message === '验证码过期');
            assert(result.code === 4);
        });

        it('## register failed cellphone or email or key captcha wrong', async () => {
            await app.model.caches.create({
                key: '13012456933',
                value: {
                    captcha: '4567',
                },
                expire: new Date().getTime() + 60 * 1000,
            });
            let result = await app
                .httpRequest()
                .post('/api/v0/users/register')
                .send({
                    username: 'test',
                    password: '123456',
                    cellphone: '13012456933',
                    captcha: '1234',
                })
                .expect(400)
                .then(res => res.body);
            assert(result.message === '验证码错误');
            assert(result.code === 5);

            result = await app
                .httpRequest()
                .post('/api/v0/users/register')
                .send({
                    username: 'test',
                    password: '123456',
                    email: '13012456933',
                    captcha: '1234',
                })
                .expect(400)
                .then(res => res.body);
            assert(result.message === '验证码错误');
            assert(result.code === 5);

            result = await app
                .httpRequest()
                .post('/api/v0/users/register')
                .send({
                    username: 'test',
                    password: '123456',
                    key: '13012456933',
                    captcha: '1234',
                })
                .expect(400)
                .then(res => res.body);
            assert(result.message === '验证码错误');
            assert(result.code === 5);
        });

        it('## register successfully', async () => {
            const result = await app
                .httpRequest()
                .post('/api/v0/users/register')
                .send({
                    username: 'test',
                    password: '123456',
                })
                .expect(200)
                .then(res => res.body);
            assert(
                result &&
                    result.id &&
                    result.username === 'test' &&
                    result.token
            );
            const account = await app.model.accounts.findOne();
            assert(account);
        });

        it('## register with oauthToken', async () => {
            await app
                .httpRequest()
                .post('/api/v0/users/register')
                .send({
                    username: 'test',
                    password: '123456',
                    oauthToken: '1234567',
                })
                .expect(200)
                .then(res => res.body);
        });
    });

    describe('# POST /users/login', () => {
        it('## login failed bad request', async () => {
            await app
                .httpRequest()
                .post('/api/v0/users/login')
                .expect(400);
        });

        it('## not allow to login for illegal user', async () => {
            await app.model.illegalUsers.create({
                username: 'test',
                password: app.util.md5('123456'),
            });
            const result = await app
                .httpRequest()
                .post('/api/v0/users/login')
                .send({
                    username: 'test',
                    password: '123456',
                })
                .expect(400)
                .then(res => res.body);
            assert(result.message === '该账号不可用');
            assert(result.code === 14);
        });

        it('## login failed user not exists', async () => {
            const result = await app
                .httpRequest()
                .post('/api/v0/users/login')
                .send({
                    username: 'test',
                    password: '123456',
                })
                .expect(400)
                .then(res => res.body);
            assert(result.message === '用户名或密码错误');
            assert(result.code === 1);
        });

        it('## login successfully', async () => {
            await app.model.users.create({
                username: 'test',
                password: app.util.md5('123456'),
            });
            const result = await app
                .httpRequest()
                .post('/api/v0/users/login')
                .send({
                    username: 'test',
                    password: '123456',
                })
                .expect(200)
                .then(res => res.body);
            const {
                data: { tokens },
            } = await app.model.userdatas.findOne();
            assert(result.token === tokens.shift());
        });
    });

    describe('# POST /users/logout', () => {
        it('## logout successfully', async () => {
            await app
                .httpRequest()
                .post('/api/v0/users/logout')
                .expect(200);
        });
    });

    describe('# GET /users/account', () => {
        // 获取余额
        it('## get users account failed unauthorized', async () => {
            await app
                .httpRequest()
                .get('/api/v0/users/account')
                .expect(401);
        });

        it('## get users account successfully', async () => {
            const { token } = await app.login({ username: 'test' });
            const result = await app
                .httpRequest()
                .get('/api/v0/users/account')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => res.body);
            assert(result.userId === 1);
            assert(result.rmb !== undefined);
        });
    });

    describe('# GET /users/profile', () => {
        // 获取用户资料
        it('## get users profile failed unauthorized', async () => {
            await app
                .httpRequest()
                .get('/api/v0/users/profile')
                .expect(401);
        });

        it('## get users profile successfully', async () => {
            const { token } = await app.login({ username: 'test' });
            let result = await app
                .httpRequest()
                .get('/api/v0/users/profile')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => res.body);
            assert(result.info === null);
            await app.model.userinfos.create({ userId: 1, qq: '123456' });
            result = await app
                .httpRequest()
                .get('/api/v0/users/profile')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => res.body);
            assert(result.info.qq === '123456');
        });
    });

    describe('# POST /users/info', () => {
        // 修改用户资料
        it('## update users info failed unauthorized', async () => {
            await app
                .httpRequest()
                .post('/api/v0/users/info')
                .expect(401);
        });

        it('## update users info successfully', async () => {
            const { token } = await app.login({ username: 'test' });
            const result = await app
                .httpRequest()
                .post('/api/v0/users/info')
                .set('Authorization', `Bearer ${token}`)
                .send({ qq: '123456' })
                .expect(200)
                .then(res => res.body);
            assert(result === true);
            const info = await app.model.userinfos.findOne();
            assert(info.qq === '123456');
        });
    });

    describe('# PUT /users/pwd', () => {
        // 修改密码
        it('## update users pwd failed unauthorized', async () => {
            await app
                .httpRequest()
                .put('/api/v0/users/pwd')
                .expect(401);
        });

        it('## update users pwd bad request', async () => {
            const { token } = await app.login({ username: 'test' });
            await app
                .httpRequest()
                .put('/api/v0/users/pwd')
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
        });

        it('## update users pwd wrong old password', async () => {
            await app.factory.create('users', {
                id: 1,
                password: app.util.md5('123456'),
            });
            const { token } = await app.login({ username: 'test' });
            const result = await app
                .httpRequest()
                .put('/api/v0/users/pwd')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: '1234567',
                    oldpassword: '1234567',
                })
                .expect(200)
                .then(res => res.body);
            assert(result === false);
        });

        it('## update users pwd successfully', async () => {
            await app.factory.create('users', {
                id: 1,
                password: app.util.md5('123456'),
            });
            const { token } = await app.login({ username: 'test' });
            const result = await app
                .httpRequest()
                .put('/api/v0/users/pwd')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: '1234567',
                    oldpassword: '123456',
                })
                .expect(200)
                .then(res => res.body);
            assert(result === true);
        });
    });

    describe('# GET /users/email_captcha', () => {
        // 获取eamil验证码
        it('## get email captcha bad request', async () => {
            await app
                .httpRequest()
                .get('/api/v0/users/email_captcha')
                .expect(400);
        });

        it('## get email captcha successfully', async () => {
            await app
                .httpRequest()
                .get('/api/v0/users/email_captcha')
                .query({
                    email: '1111@qq.com',
                })
                .expect(200);
            const cache = await app.model.caches.findOne({
                where: { key: '1111@qq.com' },
            });
            assert(cache);
        });
    });

    describe('# POST /users/email_captcha', () => {
        // 绑定、解绑邮箱
        it('## bad request', async () => {
            const { token } = await app.login({ username: 'test' });
            await app
                .httpRequest()
                .post('/api/v0/users/email_captcha')
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
        });

        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .post('/api/v0/users/email_captcha')
                .expect(401);
        });

        it('## password with email to unbind', async () => {
            const { token } = await app.login({
                username: 'test',
                email: '1111@qq.com',
            });
            let result = await app
                .httpRequest()
                .post('/api/v0/users/email_captcha')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    email: '2222@qq.com',
                    isBind: false,
                    password: '123456',
                })
                .expect(200)
                .then(res => res.body);

            assert(result[0] === 1);

            result = await app
                .httpRequest()
                .post('/api/v0/users/email_captcha')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    email: '2222@qq.com',
                    isBind: false,
                    password: '1234567',
                })
                .expect(400)
                .then(res => res.body);
            assert(result.code === 11);
            assert(result.message === '密码错误');
        });

        it('## expired captcha with email', async () => {
            const { token } = await app.login({
                username: 'test',
            });
            const result = await app
                .httpRequest()
                .post('/api/v0/users/email_captcha')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    email: '2222@qq.com',
                    isBind: false,
                    captcha: '1234567',
                })
                .expect(400)
                .then(res => res.text);
            assert(result.indexOf('验证码过期') !== -1);
        });

        it('## wrong captcha with email', async () => {
            const { token } = await app.login({
                username: 'test',
            });
            await app.model.caches.set('2222@qq.com', { captcha: '12345' });
            const result = await app
                .httpRequest()
                .post('/api/v0/users/email_captcha')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    email: '2222@qq.com',
                    isBind: false,
                    captcha: '1234567',
                })
                .expect(400)
                .then(res => res.text);
            assert(result.indexOf('验证码错误') !== -1);
        });

        it('## bind email successfully', async () => {
            const { token } = await app.login({
                username: 'test',
            });
            await app.model.caches.set('2222@qq.com', { captcha: '12345' });
            const result = await app
                .httpRequest()
                .post('/api/v0/users/email_captcha')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    email: '2222@qq.com',
                    isBind: true,
                    captcha: '12345',
                })
                .expect(200)
                .then(res => res.body);
            assert(result);
            const user = await app.model.users.findOne({
                where: {
                    id: 1,
                },
            });
            assert(user.email === '2222@qq.com');
        });
    });

    describe('# GET /users/cellphone_captcha', () => {
        it('## send captcha bad request', async () => {
            await app
                .httpRequest()
                .get('/api/v0/users/cellphone_captcha')
                .expect(400);
        });

        it('## send captcha successfully', async () => {
            await app
                .httpRequest()
                .get('/api/v0/users/cellphone_captcha')
                .query({ cellphone: '13011201245' })
                .expect(200);
            const captcha = app.model.caches.findOne({
                where: { key: '13011201245' },
            });
            assert(captcha);
        });
    });

    describe('# POST /users/cellphone_captcha', () => {
        // 绑定、解绑手机
        it('## bad request', async () => {
            const { token } = await app.login({ username: 'test' });
            await app
                .httpRequest()
                .post('/api/v0/users/cellphone_captcha')
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
        });

        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .post('/api/v0/users/cellphone_captcha')
                .expect(401);
        });

        it('## password with cellphone to unbind', async () => {
            const { token } = await app.login({
                username: 'test',
                cellphone: '1234567890',
            });
            let result = await app
                .httpRequest()
                .post('/api/v0/users/cellphone_captcha')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    cellphone: '1234567891',
                    isBind: false,
                    password: '123456',
                })
                .expect(200)
                .then(res => res.body);

            assert(result[0] === 1);

            result = await app
                .httpRequest()
                .post('/api/v0/users/cellphone_captcha')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    cellphone: '1234567892',
                    isBind: false,
                    password: '1234567',
                })
                .expect(400)
                .then(res => res.body);
            assert(result.code === 11);
            assert(result.message === '密码错误');
        });

        it('## expired captcha with cellphone', async () => {
            const { token } = await app.login({
                username: 'test',
            });
            const result = await app
                .httpRequest()
                .post('/api/v0/users/cellphone_captcha')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    cellphone: '1234567892',
                    isBind: false,
                    captcha: '1234567',
                })
                .expect(400)
                .then(res => res.text);
            assert(result.indexOf('验证码过期') !== -1);
        });

        it('## wrong captcha with cellphone', async () => {
            const { token } = await app.login({
                username: 'test',
            });
            await app.model.caches.set('1234567892', { captcha: '12345' });
            const result = await app
                .httpRequest()
                .post('/api/v0/users/cellphone_captcha')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    cellphone: '1234567892',
                    isBind: false,
                    captcha: '1234567',
                })
                .expect(400)
                .then(res => res.text);
            assert(result.indexOf('验证码错误') !== -1);
        });

        it('## bind cellphone successfully', async () => {
            const { token } = await app.login({
                username: 'test',
            });
            await app.model.caches.set('1234567892', { captcha: '12345' });
            const result = await app
                .httpRequest()
                .post('/api/v0/users/cellphone_captcha')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    cellphone: '1234567892',
                    isBind: true,
                    captcha: '12345',
                })
                .expect(200)
                .then(res => res.body);
            assert(result);
            const user = await app.model.users.findOne({
                where: {
                    id: 1,
                },
            });
            assert(user.cellphone === '1234567892');
        });

        it('## realname successfully', async () => {
            const _user = await app.login({
                username: 'test',
            });
            const token = _user.token;
            await app.factory.create('projects', {}, { user: _user });
            await app.model.caches.set('1234567892', { captcha: '12345' });
            const result = await app
                .httpRequest()
                .post('/api/v0/users/cellphone_captcha')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    cellphone: '1234567892',
                    realname: '1234567892',
                    captcha: '12345',
                })
                .expect(200)
                .then(res => res.body);
            assert(result);
            const user = await app.model.users.findOne({
                where: {
                    id: 1,
                },
            });
            assert(user.realname === '1234567892');
        });
    });

    describe('# POST /users/reset_password', () => {
        it('## bad request', async () => {
            await app
                .httpRequest()
                .post('/api/v0/users/reset_password')
                .expect(400);
        });

        it('## wrong captcha', async () => {
            const result = await app
                .httpRequest()
                .post('/api/v0/users/reset_password')
                .send({
                    key: 'string',
                    password: 'string',
                    captcha: 'string',
                })
                .expect(400)
                .then(res => res.body);
            assert(result.code === 5);
        });

        it('## reset successfully', async () => {
            await app.model.caches.set('123@qq.com', { captcha: '1234' });
            await app.factory.create('users', { email: '123@qq.com' });
            const result = await app
                .httpRequest()
                .post('/api/v0/users/reset_password')
                .send({
                    key: '123@qq.com',
                    password: '123456',
                    captcha: '1234',
                })
                .expect(200)
                .then(res => res.text);
            assert(result === 'OK');
            await app
                .httpRequest()
                .post('/api/v0/users/login')
                .send({
                    username: '123@qq.com',
                    password: '123456',
                })
                .expect(200);
        });

        it('## reset user not exist', async () => {
            await app.model.caches.set('123@qq.com', { captcha: '1234' });
            await app.factory.create('users', { email: '1234@qq.com' });
            const result = await app
                .httpRequest()
                .post('/api/v0/users/reset_password')
                .send({
                    key: '123@qq.com',
                    password: '123456',
                    captcha: '1234',
                })
                .expect(400)
                .then(res => res.body);
            assert(result.code === 10);
        });
    });

    describe('# RESOURCES /users', () => {
        it('## show user', async () => {
            let id = 'testteset';
            await app
                .httpRequest()
                .get(`/api/v0/users/id${id}`)
                .expect(400);
            const user = { id: 1, username: 'test' };
            id = Base64.encode(JSON.stringify(user));
            await app
                .httpRequest()
                .get(`/api/v0/users/id${id}`)
                .expect(404);
            await app.factory.create('users', user);
            const result = await app
                .httpRequest()
                .get(`/api/v0/users/id${id}`)
                .expect(200)
                .then(res => res.body);
            assert(result.username === user.username);
        });

        it('## index user', async () => {
            const result = await app
                .httpRequest()
                .get('/api/v0/users')
                .expect(200)
                .then(res => res.body);
            assert(Array.isArray(result));
        });

        it('## update user', async () => {
            const { token } = await app.login({
                username: 'test',
            });
            let result = await app
                .httpRequest()
                .put('/api/v0/users/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    realname: '1230123468',
                })
                .expect(200)
                .then(res => res.body);
            assert(result);

            result = await app
                .httpRequest()
                .put('/api/v0/users/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    realname: '12301234689',
                    info: { name: 'testtest' },
                })
                .expect(200)
                .then(res => res.body);
            assert(result === true);
        });
    });

    describe('# GET /users/:id/worldLimit', () => {
        it('## failed by bad request', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .get('/api/v0/users/100/worldLimit')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(400);
        });

        it('## vip no limit', async () => {
            const user = await app.login({ vip: 1 });
            const result = await app
                .httpRequest()
                .get(`/api/v0/users/${user.id}/worldLimit`)
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => res.body);
            assert(result.world === -1);
        });

        it('## tLevel no limit', async () => {
            const user = await app.login({ tLevel: 1 });
            const result = await app
                .httpRequest()
                .get(`/api/v0/users/${user.id}/worldLimit`)
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => res.body);
            assert(result.world === -1);
        });

        it('## commonUser', async () => {
            const user = await app.login();
            const result = await app
                .httpRequest()
                .get(`/api/v0/users/${user.id}/worldLimit`)
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => res.body);
            assert(result.world === 3);
            assert(result.usedWorld === 0);
        });
    });
});
