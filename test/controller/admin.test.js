const md5 = require('blueimp-md5');
const { app, assert } = require('egg-mock/bootstrap');

describe('test/controller/admin.test.js', () => {
    let token;
    let userId;
    beforeEach(async () => {
        // 创建测试数据
        await app.factory.createMany('users', 10);
        await app.model.admins
            .create({ username: 'admin001', password: md5('123456') })
            .then(o => o.toJSON());
    });
    describe('# POST /admins/login', () => {
        it('## admin login successfully', async () => {
            const user = await app
                .httpRequest()
                .post('/api/v0/admins/login')
                .send({ username: 'admin001', password: '123456' })
                .expect(200)
                .then(res => res.body);
            assert(user.token);
            token = user.token;
            userId = user.id;
            assert(user.username === 'admin001');
        });

        it('## miss username or password', async () => {
            await app
                .httpRequest()
                .post('/api/v0/admins/login')
                .send({ password: '123456' })
                .expect(400);
        });

        it('## username or password error', async () => {
            const resp = await app
                .httpRequest()
                .post('/api/v0/admins/login')
                .send({ username: 'admin001', password: '1234567' })
                .expect(400)
                .then(res => res.body);
            assert(resp.code === 1);
            assert(resp.message === '用户名或密码错误');
        });
    });

    describe('# GET /admins/userToken', () => {
        it("## can not get not exist user's token", async () => {
            await app
                .httpRequest()
                .get('/api/v0/admins/userToken?userId=9999')
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
        });

        it('## get userToken successfully', async () => {
            // 取用户token
            const userToken = await app
                .httpRequest()
                .get(`/api/v0/admins/userToken?userId=${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => res.body);
            assert(userToken);
        });

        it('## invalidate userId', async () => {
            await app
                .httpRequest()
                .get('/api/v0/admins/userToken?userId=aaa')
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
        });
    });

    describe('# ALL /admins/query', () => {
        it('## get query successfully', async () => {
            const list = await app.model.users.findAll({
                where: { id: { $gt: 0 } },
            });
            const list1 = await app
                .httpRequest()
                .get(
                    '/api/v0/admins/query?sql=select * from users where id > 0'
                )
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => res.body);
            assert(list1.length === list.length);
        });

        it('## post query successfully', async () => {
            const list = await app.model.users.findAll({
                where: { id: { $gt: 0 } },
            });
            const list1 = await app
                .httpRequest()
                .post(
                    '/api/v0/admins/query?sql=select * from users where id > 0'
                )
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => res.body);
            assert(list1.length === list.length);
        });

        it('## query unauthorized return 500', async () => {
            await app
                .httpRequest()
                .get(
                    '/api/v0/admins/query?sql=select * from users where id > 0'
                )
                .set('Authorization', 'Bearer fake token')
                .expect(500)
                .then(res => res.body);
        });

        it('## query bad sql string return 404', async () => {
            const resp = await app
                .httpRequest()
                .get('/api/v0/admins/query?sql=delete from users')
                .set('Authorization', `Bearer ${token}`)
                .expect(404)
                .then(res => res);
            assert(resp.text.indexOf('sql 不合法') !== -1);
        });

        it('## query bad sql string return 500', async () => {
            await app
                .httpRequest()
                .get(
                    '/api/v0/admins/query?sql=select * from tableNotExist where id > 0'
                )
                .set('Authorization', `Bearer ${token}`)
                .expect(500);
        });
    });

    describe('# RESOURCES /admins/:resources', () => {
        it('## find some resources that are not exist', async () => {
            await app
                .httpRequest()
                .get('/api/v0/admins/notExistResources')
                .set('Authorization', `Bearer ${token}`)
                .expect(400)
                .then(res => res.body);
        });

        it('## find all users', async () => {
            const list = await app
                .httpRequest()
                .get('/api/v0/admins/users')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => res.body);
            assert(list.length === 10);
        });

        it('## find one user', async () => {
            const user = await app
                .httpRequest()
                .get('/api/v0/admins/users/1')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => res.body);
            assert(user.id === 1);
        });

        it('## find one user without token return 500', async () => {
            await app
                .httpRequest()
                .get('/api/v0/admins/users/1')
                .expect(500)
                .then(res => res.body);
        });

        it('## find one user bad id', async () => {
            await app
                .httpRequest()
                .get('/api/v0/admins/users/aaa')
                .set('Authorization', `Bearer ${token}`)
                .expect(400)
                .then(res => res.body);
        });

        it('## create one user', async () => {
            const resource = await app
                .httpRequest()
                .post('/api/v0/admins/users')
                .send({ username: 'user100', password: 'xiaoyao', sex: 'F' })
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => res.body);
            assert(resource.username === 'user100');
        });

        it('## create one user bad params', async () => {
            await app
                .httpRequest()
                .post('/api/v0/admins/users')
                .send({ password: 'xiaoyao', sex: 'F' })
                .set('Authorization', `Bearer ${token}`)
                .expect(500)
                .then(res => res.body);
        });

        it('## update one user', async () => {
            await app
                .httpRequest()
                .put('/api/v0/admins/users/1')
                .send({ password: 'xiaoyao', sex: 'F' })
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => res.body);
            const user = await app.model.users.findOne({ where: { id: 1 } });
            assert(user.sex === 'F');
        });

        it('## update one user with bad request', async () => {
            await app
                .httpRequest()
                .put('/api/v0/admins/users/aaa')
                .send({ password: 'xiaoyao', sex: 'F' })
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
        });

        it('## delete one user', async () => {
            await app
                .httpRequest()
                .delete('/api/v0/admins/users/1')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => res.body);
            const user = await app.model.users.findOne({ where: { id: 1 } });
            assert(!user);
        });

        it('## delete one user with bad request', async () => {
            await app
                .httpRequest()
                .delete('/api/v0/admins/users/aaa')
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
        });
    });

    describe('# POST /admins/:resources/query', () => {
        it('## query users', async () => {
            const users = await app
                .httpRequest()
                .post('/api/v0/admins/users/query')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    where: {
                        id: {
                            $gt: 0,
                        },
                    },
                    include: [
                        {
                            $model$: 'roles',
                            as: 'roles',
                        },
                    ],
                })
                .expect(200)
                .then(res => res.body);
            assert(users.count === 10);
            assert(Array.isArray(users.rows));
            assert(Array.isArray(users.rows[0].roles));
        });

        it('## query users bad options', async () => {
            await app
                .httpRequest()
                .post('/api/v0/admins/users/query')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    where: {
                        id: {
                            $ggg: 1,
                        },
                    },
                    include: [
                        {
                            _model: 'roles',
                            as: 'roles',
                        },
                    ],
                })
                .expect(500);
        });
    });

    describe('# POST /admins/:resources/search', () => {
        it('## search users', async () => {
            const users = await app
                .httpRequest()
                .post('/api/v0/admins/users/search')
                .set('Authorization', `Bearer ${token}`)
                .set('x-per-page', 1)
                .set('x-order', 'username-desc')
                .send({
                    id: {
                        $gte: 1,
                    },
                })
                .expect(200)
                .then(res => res.body);
            assert(users.count === 10);
            assert(Array.isArray(users.rows));
            assert(users.rows.length === 1);
        });

        it('## search users failed', async () => {
            await app
                .httpRequest()
                .post('/api/v0/admins/users/search')
                .set('Authorization', `Bearer ${token}`)
                .set('x-per-page', 1)
                .set('x-order', 'username-desc')
                .send({
                    aaa: {
                        $gte: 1,
                    },
                })
                .expect(500)
                .then(res => res.body);
        });
    });

    describe('# POST /admins/projects/:projectId/systemTags', () => {
        it('## should success', async () => {
            let result = await app
                .httpRequest()
                .post('/api/v0/admins/projects/1/systemTags')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    tags: [
                        {
                            tagId: 1,
                        },
                        {
                            tagId: 2,
                        },
                    ],
                })
                .expect(200)
                .then(res => res.body);
            assert(
                result.length === 2 && result[0] === true && result[1] === true
            );

            result = await app
                .httpRequest()
                .post('/api/v0/admins/projects/1/systemTags')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    tags: [
                        {
                            tagId: 1,
                        },
                        {
                            tagId: 2,
                        },
                    ],
                })
                .expect(200)
                .then(res => res.body);
            assert(
                result.length === 2 &&
                    result[0] === false &&
                    result[1] === false
            );
        });
        it('## should return bad request', async () => {
            await app
                .httpRequest()
                .post('/api/v0/admins/projects/1/systemTags')
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
        });
    });

    describe('# PUT /admins/projects/:projectId/systemTags/:tagId', () => {
        it('## should success', async () => {
            await app
                .httpRequest()
                .post('/api/v0/admins/projects/1/systemTags')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    tags: [
                        {
                            tagId: 1,
                        },
                        {
                            tagId: 2,
                        },
                    ],
                })
                .expect(200);
            const result = await app
                .httpRequest()
                .put('/api/v0/admins/projects/1/systemTags/1')
                .set('Authorization', `Bearer ${token}`)
                .send({ sn: 10 })
                .expect(200)
                .then(res => res.body);
            assert(result.length === 1 && result[0] === 1);
        });

        it('## bad request', async () => {
            await app
                .httpRequest()
                .put('/api/v0/admins/projects/1/systemTags/aaa')
                .set('Authorization', `Bearer ${token}`)
                .send({ sn: 10 })
                .expect(400);
        });
    });
    describe('# DELETE /admins/projects/:projectId/systemTags', () => {
        it('## should success', async () => {
            await app
                .httpRequest()
                .post('/api/v0/admins/projects/1/systemTags')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    tags: [
                        {
                            tagId: 1,
                        },
                        {
                            tagId: 2,
                        },
                    ],
                })
                .expect(200);
            let result = await app
                .httpRequest()
                .delete('/api/v0/admins/projects/1/systemTags')
                .set('Authorization', `Bearer ${token}`)
                .send({ tagIds: [ 1, 2 ] })
                .expect(200)
                .then(res => res.body);
            assert(result.length === 2 && result[0] === 1 && result[1] === 1);
            result = await app
                .httpRequest()
                .delete('/api/v0/admins/projects/1/systemTags')
                .set('Authorization', `Bearer ${token}`)
                .send({ tagIds: [ 1, 2 ] })
                .expect(200)
                .then(res => res.body);
            assert(result.length === 2 && result[0] === 0 && result[1] === 0);
        });

        it('## bad request', async () => {
            await app
                .httpRequest()
                .delete('/api/v0/admins/projects/1/systemTags')
                .set('Authorization', `Bearer ${token}`)
                .send({ tagIds: [ 'aaa', 2 ] })
                .expect(400);
        });
    });

    describe('# POST /admins/:resources/bulk', () => {
        it('## bulk create users successfully', async () => {
            const users = [
                {
                    username: 'user200',
                    password: '12345678',
                },
            ];
            await app
                .httpRequest()
                .post('/api/v0/admins/users/bulk')
                .set('Authorization', `Bearer ${token}`)
                .send({ datas: users })
                .expect(200)
                .then(res => res.body);
        });
    });

    describe('# PUT /admins/:resources/bulk', () => {
        it('## bulk update users successfully', async () => {
            const users = [
                {
                    id: 1,
                    username: 'user201',
                },
            ];
            await app
                .httpRequest()
                .put('/api/v0/admins/users/bulk')
                .set('Authorization', `Bearer ${token}`)
                .send({ datas: users })
                .expect(200)
                .then(res => res.body);
        });

        it('## bulk update users with "where" options successfully', async () => {
            await app
                .httpRequest()
                .put('/api/v0/admins/users/bulk')
                .set('Authorization', `Bearer ${token}`)
                .send({ query: { sex: 'F' }, data: { sex: 'M' } })
                .expect(200)
                .then(res => res.body);
        });
    });

    describe('# DELETE /admins/:resources/bulk', () => {
        it('## delete with query options', async () => {
            await app
                .httpRequest()
                .delete('/api/v0/admins/users/bulk')
                .set('Authorization', `Bearer ${token}`)
                .send({ query: { sex: 'F' } })
                .expect(200)
                .then(res => res.body);
        });
        it('## delete with datas', async () => {
            await app
                .httpRequest()
                .delete('/api/v0/admins/users/bulk')
                .set('Authorization', `Bearer ${token}`)
                .send({ datas: [{ id: 1 }] })
                .expect(200)
                .then(res => res.body);
        });
    });
});
