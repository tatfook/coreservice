const { app, mock, assert } = require('egg-mock/bootstrap');
const axios = require('axios');
const _ = require('lodash');
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
            const result = await app
                .httpRequest()
                .get('/api/v0/keepworks/svg_captcha')
                .expect(200)
                .then(res => res.body);
            const { captcha } = result;
            assert(captcha.indexOf('svg') !== -1);
        });

        it('## get png captcha successfully', async () => {
            const result = await app
                .httpRequest()
                .get('/api/v0/keepworks/svg_captcha')
                .query({
                    png: true,
                })
                .expect(200)
                .then(res => res.body);
            const { key, captcha } = result;
            captchaKey = key;
            captchaPic = captcha;
            assert(captcha.indexOf('jpeg') !== -1);
        });
    });

    describe('# GET /keepworks/captcha/:key', () => {
        // 根据key获取验证码图片
        it('## get picture by key', async () => {
            await app.redis.set(captchaKey, captchaPic, 'EX', 60 * 10);
            const res = await app
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
                .post('/api/v0/keepworks/svg_captcha')
                .expect(400);
        });

        it('## verify successfully', async () => {
            await app.model.caches.create({
                key: 'key',
                value: 'value',
                expire: new Date().getTime() + 1000 * 60,
            });
            const result = await app
                .httpRequest()
                .post('/api/v0/keepworks/svg_captcha')
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
            const result = await app
                .httpRequest()
                .post('/api/v0/keepworks/svg_captcha')
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
            const result = await app
                .httpRequest()
                .get('/api/v0/keepworks/statistics')
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
            const result = await app
                .httpRequest()
                .get('/api/v0/keepworks/ip')
                .expect(200)
                .then(res => res.body);
            const ips = await app.model.ips.findAndCountAll();
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
                .get('/api/v0/keepworks/ip')
                .expect(500);
        });
    });

    describe('# POST /keepworks/page_visit', () => {
        it('## add page visit successfully', async () => {
            let result = await app
                .httpRequest()
                .post('/api/v0/keepworks/page_visit')
                .send({
                    url: 'www.baidu.com',
                })
                .expect(200)
                .then(res => res.body);
            assert(result === 1);
            result = await app
                .httpRequest()
                .post('/api/v0/keepworks/page_visit')
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
                .post('/api/v0/keepworks/page_visit')
                .expect(400);
        });
    });

    describe('# GET /keepworks/page_visit', () => {
        it('## get page visit successfully', async () => {
            const result = await app
                .httpRequest()
                .get('/api/v0/keepworks/page_visit')
                .query({
                    url: 'www.baidu.com',
                })
                .expect(200)
                .then(res => res.body);
            assert(result === 0);
            await app
                .httpRequest()
                .post('/api/v0/keepworks/page_visit')
                .send({
                    url: 'www.baidu.com',
                })
                .expect(200);
            const result2 = await app
                .httpRequest()
                .get('/api/v0/keepworks/page_visit')
                .query({
                    url: 'www.baidu.com',
                })
                .expect(200)
                .then(res => res.body);
            assert(parseInt(result2) === 1);
        });
    });

    describe('# POST /keepworks/paracraft_download_count', async () => {
        it('## add paracraft download count', async () => {
            let result = await app
                .httpRequest()
                .post('/api/v0/keepworks/paracraft_download_count')
                .expect(200)
                .then(res => res.body);
            assert(result === 1);
            result = await app
                .httpRequest()
                .post('/api/v0/keepworks/paracraft_download_count')
                .expect(200)
                .then(res => res.body);
            assert(result === 2);
        });

        it('## add paracraft download count failed', async () => {
            mock(app.redis, 'incr', () => {
                throw new Error();
            });
            await app
                .httpRequest()
                .post('/api/v0/keepworks/paracraft_download_count')
                .expect(500);
        });
    });

    describe('# GET /keepworks/paracraft_download_count', () => {
        it('## get paracraft download count successfully', async () => {
            let count = await app
                .httpRequest()
                .get('/api/v0/keepworks/paracraft_download_count')
                .expect(200)
                .then(res => res.body);
            assert(count === 0);
            // 增加下载量
            await app
                .httpRequest()
                .post('/api/v0/keepworks/paracraft_download_count')
                .expect(200);
            count = await app
                .httpRequest()
                .get('/api/v0/keepworks/paracraft_download_count')
                .expect(200)
                .then(res => res.body);
            assert(count === 1);
        });
    });

    describe('# POST /keepworks/paracraft_download_url', () => {
        it('## update download url successfully', async () => {
            const admin = await app.adminLogin();
            const token = admin.token;
            const body = { url: 'www.baidu.com' };
            const result = await app
                .httpRequest()
                .post('/api/v0/keepworks/paracraft_download_url')
                .set('Authorization', `Bearer ${token}`)
                .send(body)
                .expect(200)
                .then(res => res.text);
            assert(result === 'OK');
            assert(
                _.isEqual(
                    JSON.parse(await app.redis.get('paracraft_download_url')),
                    body
                )
            );
        });

        it('## update download url failed unauthorized', async () => {
            const body = { url: 'www.baidu.com' };
            await app
                .httpRequest()
                .post('/api/v0/keepworks/paracraft_download_url')
                .send(body)
                .expect(401);
        });
    });

    describe('# GET /keepworks/paracraft_download_url', () => {
        it('## get paracraft download url successfully', async () => {
            const target = { url: 'www.baidu.com' };
            await app.redis.set(
                'paracraft_download_url',
                JSON.stringify(target)
            );
            const expected = await app
                .httpRequest()
                .get('/api/v0/keepworks/paracraft_download_url')
                .expect(200)
                .then(res => res.body);
            assert(target.url === expected.url);
        });

        it("## can't get paracraft download url", async () => {
            const expected = await app
                .httpRequest()
                .get('/api/v0/keepworks/paracraft_download_url')
                .expect(200)
                .then(res => res.body);
            assert(_.isEqual(expected, {}));
        });

        it('## parse paracraft download url failed', async () => {
            const target = 'string';
            await app.redis.set('paracraft_download_url', target);
            const expected = await app
                .httpRequest()
                .get('/api/v0/keepworks/paracraft_download_url')
                .expect(200)
                .then(res => res.body);
            assert(_.isEqual(expected, {}));
        });
    });
});
