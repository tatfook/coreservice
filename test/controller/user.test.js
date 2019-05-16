const md5 = require("blueimp-md5");

const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("/users", () => {
	before(async () => {
	});

	it("修改密码 token失效测试", async () => {
		const apiUrlPrefix = "/api/v0/";
		// 构建用户
		const user = await app.model.users.create({username:"user0000", password: md5("123456")}).then(o => o.toJSON());
		
		// 登录
		const token1 = await app.httpRequest().post(`${apiUrlPrefix}users/login`).send({username:"user0000", password: md5("123456")}).then(res => res.body.token);
		const token2 = await app.httpRequest().post(`${apiUrlPrefix}users/login`).send({username:"user0000", password: md5("123456")}).then(res => res.body.token);
		
		// 获取认证用户信息
		const profile = await app.httpRequest().get(`${apiUrlPrefix}/users/profile`).set("Authorization", `Bearer ${token1}`).expect(200).then(res => res.body);
		assert(profile.username == "user0000");

		// 修改密码
		await app.httpRequest().put(`${apiUrlPrefix}/users/pwd`).send({password:"123456", oldpassword:"123456"}).set("Authorization", `Bearer ${token2}`).expect(200);

		await app.httpRequest().get(`${apiUrlPrefix}/users/profile`).set("Authorization", `Bearer ${token1}`).expect(411);
	});
});
