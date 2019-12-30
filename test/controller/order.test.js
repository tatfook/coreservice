const { app, assert } = require('egg-mock/bootstrap');

describe('test/controller/order.test.js', () => {
    describe('# POST /orders', () => {
        it('## unauthorized', async () => {
            await app
                .httpRequest()
                .post('/api/v0/orders')
                .expect(401);
        });

        it('## bad request', async () => {
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/orders')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(422);
        });

        it('## wx pay', async () => {
            app.mockService('pay', 'charge', function() {
                return {
                    credential: {
                        wx_pub_qr: 'http://qq.com',
                    },
                };
            });
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/orders')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    amount: 50,
                    channel: 'wx_pub_qr',
                })
                .expect(200);
        });

        it('## ali pay', async () => {
            app.mockService('pay', 'charge', function() {
                return {
                    credential: {
                        alipay_qr: 'http://alibaba.com',
                    },
                };
            });
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/orders')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    amount: 50,
                    channel: 'alipay_qr',
                })
                .expect(200);
            const order = await app.model.orders.findOne();
            assert(order);
        });

        it('## failed', async () => {
            app.mockService('pay', 'charge', function() {
                return null;
            });
            // 提交pingpp充值请求, 获取二维码失败
            const user = await app.login();
            await app
                .httpRequest()
                .post('/api/v0/orders')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    amount: 50,
                    channel: 'wx_pub_qr',
                })
                .expect(500);

            app.mockService('pay', 'charge', function() {
                return {
                    credential: {
                        wx_pub_qr: null,
                    },
                };
            });

            await app
                .httpRequest()
                .post('/api/v0/orders')
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                    amount: 50,
                    channel: 'wx_pub_qr',
                })
                .expect(500);
        });
    });

    describe('# POST /orders/charge', () => {
        beforeEach('## mockservice', async () => {
            app.mockService('pay', 'verifySignature', function() {
                return true;
            });
        });
        it('## 签名验证失败', async () => {
            // 签名验证失败
            app.mockService('pay', 'verifySignature', function() {
                return false;
            });
            await app
                .httpRequest()
                .post('/api/v0/orders/charge')
                .set('x-pingplusplus-signature', 'aaa')
                .send({})
                .expect(400)
                .then(res => {
                    assert(res.text.includes('签名验证失败'));
                });
        });

        it('## 交易记录不存在', async () => {
            // 交易记录不存在
            await app
                .httpRequest()
                .post('/api/v0/orders/charge')
                .set('x-pingplusplus-signature', 'aaa')
                .send({
                    type: 'charge.succeeded',
                    data: {
                        object: { order_no: 'test', charge_order_no: 'test' },
                    },
                })
                .expect(400)
                .then(res => {
                    assert(res.text.includes('交易记录不存在'));
                });
        });

        it('## 订单已过期,支付失败', async () => {
            // 订单已过期
            const order = await app.factory.create('orders', { state: 512 });
            await app
                .httpRequest()
                .post('/api/v0/orders/charge')
                .set('x-pingplusplus-signature', 'aaa')
                .send({
                    type: 'charge.succeeded',
                    data: {
                        object: {
                            order_no: order.orderNo,
                            charge_order_no: 'test',
                        },
                    },
                })
                .expect(400)
                .then(res => {
                    assert(res.text.includes('订单已过期'));
                });
        });

        it('## 订单已过期，支付成功', async () => {
            // 订单已过期
            const order = await app.factory.create('orders', { state: 256 });
            await app
                .httpRequest()
                .post('/api/v0/orders/charge')
                .set('x-pingplusplus-signature', 'aaa')
                .send({
                    type: 'charge.succeeded',
                    data: {
                        object: {
                            order_no: order.orderNo,
                            charge_order_no: 'test',
                        },
                    },
                })
                .expect(400)
                .then(res => {
                    assert(res.text.includes('订单已过期'));
                });
        });

        it('## 参数错误', async () => {
            // 参数错误
            const order = await app.factory.create('orders', { state: 128 });
            await app
                .httpRequest()
                .post('/api/v0/orders/charge')
                .set('x-pingplusplus-signature', 'aaa')
                .send({
                    type: 'charge.failed',
                    data: {
                        object: {
                            order_no: order.orderNo,
                            charge_order_no: order.orderNo,
                        },
                    },
                })
                .expect(400)
                .then(res => {
                    assert(res.text.includes('参数错误'));
                });
        });

        it('## success', async () => {
            const user = await app.factory.create('users');
            let order = await app.factory.create(
                'orders',
                { state: 128 },
                { user }
            );
            await app.model.accounts.create({
                userId: user.id,
            });
            await app
                .httpRequest()
                .post('/api/v0/orders/charge')
                .set('x-pingplusplus-signature', 'aaa')
                .send({
                    type: 'charge.succeeded',
                    data: {
                        object: {
                            order_no: order.orderNo,
                            charge_order_no: order.orderNo,
                        },
                    },
                })
                .expect(200);
            order = await app.model.orders.findOne();
            assert(order.state === 256); // 订单状态
            assert(await app.model.discounts.findOne()); // 优惠券
            assert(await app.model.trades.findOne()); // 交易明细
            assert(
                (await app.model.accounts.findOne()).rmb ===
                    parseInt(order.amount)
            ); // 余额
        });
    });

    describe('# GET /orders/:id', () => {
        it('## success', async () => {
            const user = await app.login();
            const order = await app.factory.create(
                'orders',
                { state: 128 },
                { user }
            );
            await app
                .httpRequest()
                .get(`/api/v0/orders/${order.id}`)
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200);
        });
    });
});
