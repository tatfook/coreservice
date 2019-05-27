
const { app, mock, assert  } = require('egg-mock/bootstrap');
const initData = require("../data.js");

describe("oauth app", () => {
	before(async () => {
		await initData(app);
	});

	it("密码式认证", async () => {
		const data = await app.httpRequest().post("/api/v0/oauth_apps/login").send({
			username:"user001",
			password:"123456",
		}).expect(200).then(res => res.body);
		assert(data.token);
	});

	it("认证码认证", async () => {
		// 正常登陆
		const data = await app.httpRequest().post("/api/v0/users/login").send({
			username:"user001",
			password:"123456",
		}).expect(200).then(res => res.body);

		assert(data && data.token);
		const token = data.token;

		// 获取认证码
		const code = await app.httpRequest().get("/api/v0/oauth_apps/oauth_code?client_id=123456").set("Authorization", `Bearer ${token}`).expect(200).then(res => res.body.code);
		assert(code);

		// 获取token
		const auth_token = await app.httpRequest().post("/api/v0/oauth_apps/oauth_token").send({client_id:"123456", client_secret:"abcdef", code:code}).set("Authorization", `Bearer ${token}`).expect(200).then(res => res.body.token);
		assert(auth_token);
	});
});
