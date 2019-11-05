const md5 = require('blueimp-md5');
const { app, mock, assert } = require('egg-mock/bootstrap');
const axios = require('axios');
describe('test/controller/keepwork.test.js', () => {
    before(async () => {});

    describe('# POST /keepworks/email', () => {
        it('## should send email successfully', async () => {
            // mock email.send 方法
            app.mockService('email', 'send', () => {
                return true;
            });
            const result = await app
                .httpRequest()
                .post('/api/v0/keepworks/email')
                .send({
                    html: '<h1>hello</h1>',
                    to: 'test@test.com',
                    subject: 'test',
                })
                .expect(200)
                .then(res => res.body);
            assert(result === true);
        });

        it('## should fail when bad request', async () => {
            await app
                .httpRequest()
                .post('/api/v0/keepworks/email')
                .send({
                    to: 'test@test.com',
                    from: 'from@test.com',
                    subject: 'test',
                })
                .expect(400);
        });
    });
    let captchaKey;
    let captchaPic;
    describe('# GET /keepworks/svg_captcha', () => {
        it('## get svg captcha successfully', async () => {
            let result = await app
                .httpRequest()
                .get('/api/v0/keepworks/svg_captcha')
                .expect(200)
                .then(res => res.body);
            let { key, captcha } = result;
            assert(captcha.indexOf('svg') !== -1);
        });

        it('## get png captcha successfully', async () => {
            let result = await app
                .httpRequest()
                .get('/api/v0/keepworks/svg_captcha')
                .query({
                    png: true,
                })
                .expect(200)
                .then(res => res.body);
            let { key, captcha } = result;
            captchaKey = key;
            captchaPic = captcha;
            assert(captcha.indexOf('jpeg') !== -1);
        });
    });

    describe('# GET /keepworks/captcha/:key', () => {
        // 根据key获取验证码图片
        it('## get picture by key', async () => {
            await app.redis.set(captchaKey, captchaPic, 'EX', 60 * 10);
            let res = await app
                .httpRequest()
                .get(`/api/v0/keepworks/captcha/${captchaKey}`)
                .expect(200);
            assert(res.header['content-type'] === 'image/png');
        });

        it('## get picture 404', async () => {
            await app
                .httpRequest()
                .get(`/api/v0/keepworks/captcha/${captchaKey}`)
                .expect(404);
        });
    });

    describe('# POST /keepworks/svg_captcha', () => {
        // 验证验证码
        it('## failed bad request', async () => {
            await app
                .httpRequest()
                .post(`/api/v0/keepworks/svg_captcha`)
                .expect(400);
        });

        it('## verify successfully', async () => {
            await app.model.caches.create({
                key: 'key',
                value: 'value',
                expire: new Date().getTime() + 1000 * 60,
            });
            let result = await app
                .httpRequest()
                .post(`/api/v0/keepworks/svg_captcha`)
                .send({
                    key: 'key',
                    captcha: 'value',
                })
                .expect(200)
                .then(res => res.body);
            assert(result === true);
        });

        it('## verify failed cause by expired', async () => {
            await app.model.caches.create({
                key: 'key',
                value: 'value',
                expire: new Date().getTime() - 1000 * 60,
            });
            let result = await app
                .httpRequest()
                .post(`/api/v0/keepworks/svg_captcha`)
                .send({
                    key: 'key',
                    captcha: 'value',
                })
                .expect(200)
                .then(res => res.body);
            assert(result === false);
        });
    });

    describe('# GET /keepworks/statistics', () => {
        it('## get statistics successfully', async () => {
            let result = await app
                .httpRequest()
                .get(`/api/v0/keepworks/statistics`)
                .expect(200)
                .then(res => res.body);
            assert(result.paracraftCount !== undefined);
            assert(result.siteCount !== undefined);
            assert(result.recuritCount !== undefined);
            assert(result.userCount !== undefined);
            assert(result.projectCount !== undefined);
        });
    });

    describe('# GET /keepworks/ip', () => {
        it('## get ip succussfully', async () => {
            mock(axios, 'get', () => {
                // 模拟的参数，可以是 buffer / string / json，
                // 都会转换成 buffer
                // 按照请求时的 options.dataType 来做对应的转换
                return {
                    then: () => {
                        return `
2|apnic|20191105|62824|19830613|20191104|+1000
apnic|*|asn|*|9600|summary
apnic|*|ipv4|*|43466|summary
apnic|*|ipv6|*|9758|summary
apnic|JP|asn|173|1|20020801|allocated
apnic|NZ|asn|681|1|20020801|allocated
apnic|AU|asn|1221|1|20000131|allocated
apnic|CN|asn|1233|1|20020801|allocated
apnic|CN|ipv4|103.121.88.0|1024|20180820|allocated
apnic|CN|asn|3717|1|20020801|allocated`;
                    },
                };
            });
            let result = await app
                .httpRequest()
                .get(`/api/v0/keepworks/ip`)
                .expect(200)
                .then(res => res.body);
            let ips = await app.model.ips.findAndCountAll();
            assert(ips.count > 0);
            assert(result.length > 0);
        });

        it('## get ip failed caurse by network error', async () => {
            mock(axios, 'get', () => {
                // 模拟的参数，可以是 buffer / string / json，
                // 都会转换成 buffer
                // 按照请求时的 options.dataType 来做对应的转换
                throw new Error();
            });
            await app
                .httpRequest()
                .get(`/api/v0/keepworks/ip`)
                .expect(500);
        });
    });

    describe('# POST /keepworks/page_visit', () => {
        it('## add page visit successfully', async () => {
            let result = await app
                .httpRequest()
                .post(`/api/v0/keepworks/page_visit`)
                .send({
                    url: 'www.baidu.com',
                })
                .expect(200)
                .then(res => res.body);
            assert(result === 1);
            result = await app
                .httpRequest()
                .post(`/api/v0/keepworks/page_visit`)
                .send({
                    url: 'www.baidu.com',
                })
                .expect(200)
                .then(res => res.body);
            assert(result === 2);
        });
        it('## add page visit failed bad request', async () => {
            await app
                .httpRequest()
                .post(`/api/v0/keepworks/page_visit`)
                .expect(400);
        });
    });

    describe('# GET /keepworks/page_visit', () => {
        // it.only('## get page visit successfully', async () => {
        //     let result = await app
        //         .httpRequest()
        //         .get(`/api/v0/keepworks/page_visit`)
        //         .query({
        //             url: 'www.baidu.com',
        //         })
        //         .expect(200)
        //         .then(res => res.body);
        //     assert(result === 0);
        //     await app
        //         .httpRequest()
        //         .post(`/api/v0/keepworks/page_visit`)
        //         .send({
        //             url: 'www.baidu.com',
        //         })
        //         .expect(200);
        //     let result2 = await app
        //         .httpRequest()
        //         .get(`/api/v0/keepworks/page_visit`)
        //         .query({
        //             url: 'www.baidu.com',
        //         })
        //         .expect(200)
        //         .then(res => res.body);
        //     assert(parseInt(result2) === 1);
        // });
    });
    // it('001 用户投诉 系统统计 敏感词列表 系统标签', async () => {
    //     // 用户反馈
    //     await app
    //         .httpRequest()
    //         .post('/api/v0/feedbacks')
    //         .send({
    //             userId: 1,
    //             username: 'xiaoyao',
    //             type: 0,
    //             url: '/index',
    //             description: 'test',
    //         })
    //         .expect(res => res.statusCode == 200);
    //     // 系统统计
    //     await app
    //         .httpRequest()
    //         .get('/api/v0/keepworks/statistics')
    //         .expect(res => res.statusCode == 200)
    //         .then(res => res.body);
    //     // 敏感词列表
    //     await app
    //         .httpRequest()
    //         .get('/api/v0/keepworks/sensitiveWords')
    //         .expect(res => res.statusCode == 200)
    //         .then(res => res.body);
    //     // 系统标签
    //     await app
    //         .httpRequest()
    //         .get('/api/v0/systemTags?classify=1')
    //         .expect(res => res.statusCode == 200)
    //         .then(res => res.body);
    // });

    // it('002 parcraft 下载量 下载地址 页面访问量', async () => {
    //     await app.redis.set('www.baidu.com-page-visit-count', 0);
    //     // 增加页面访问量
    //     let count = await app
    //         .httpRequest()
    //         .post('/api/v0/keepworks/page_visit')
    //         .send({ url: 'www.baidu.com' })
    //         .expect(res => res.statusCode === 200)
    //         .then(res => res.body);
    //     assert(count === 1);

    //     // 获取页面访问量
    //     count = await app
    //         .httpRequest()
    //         .get('/api/v0/keepworks/page_visit?url=www.baidu.com')
    //         .expect(res => res.statusCode === 200)
    //         .then(res => res.text);
    //     assert(count === '1');

    //     // 增加paracraft下载量
    //     await app.redis.set('paracraft_download_count', 0);
    //     let downLoad = await app
    //         .httpRequest()
    //         .post('/api/v0/keepworks/paracraft_download_count')
    //         .expect(res => res.statusCode === 200)
    //         .then(res => res.body);
    //     assert(downLoad === 1);

    //     // 获取paracraft下载量
    //     downLoad = await app
    //         .httpRequest()
    //         .get('/api/v0/keepworks/paracraft_download_count')
    //         .expect(res => res.statusCode === 200)
    //         .then(res => res.text);
    //     assert(downLoad === '1');

    //     // 创建用户
    //     await app.factory.createMany('users', 10);
    //     await app.model.admins
    //         .create({ username: 'admin001', password: md5('123456') })
    //         .then(o => o.toJSON());
    //     // 登录
    //     let user = await app
    //         .httpRequest()
    //         .post('/api/v0/admins/login')
    //         .send({ username: 'admin001', password: '123456' })
    //         .expect(res => assert(res.statusCode == 200))
    //         .then(res => res.body);
    //     assert(user.token);
    //     const token = user.token;

    //     // 设置paracraft下载地址
    //     let downLoadUrl = await app
    //         .httpRequest()
    //         .post('/api/v0/keepworks/paracraft_download_url')
    //         .send({ url: 'www.bilibili.com' })
    //         .set('Authorization', `Bearer ${token}`)
    //         .expect(res => res.statusCode === 200)
    //         .then(res => res.text);

    //     assert(downLoadUrl === 'OK');

    //     // 获取paracraft下载地址
    //     downLoadUrl = await app
    //         .httpRequest()
    //         .get('/api/v0/keepworks/paracraft_download_url')
    //         .expect(res => res.statusCode === 200)
    //         .then(res => res.body);
    //     assert(downLoadUrl.url === 'www.bilibili.com');
    // });
});
