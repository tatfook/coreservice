const { app, mock, assert } = require('egg-mock/bootstrap');

describe('充值订单', () => {
    before(async () => {});

    it('001 订单创建', async () => {
        // 登录
        //let user = await app.httpRequest().post("/api/v0/users/login").send({username:"user001", password:"123456"}).expect(res => assert(res.statusCode == 200)).then(res => res.body);
        //assert(user.token);
        //const token = user.token;
        //// 创建充值订单
        //let order = await app.httpRequest().post("/api/v0/orders").send({channel:"alipay_qr", amount:100}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
        //assert(order.id);
        //// 查询充值状态
        //order = await app.httpRequest().get("/api/v0/orders/" + order.id).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
        //assert(order.state == 1);
    });
});
