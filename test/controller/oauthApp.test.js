
const md5 = require("blueimp-md5");
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("oauth app", () => {
	before(async () => {
	});

	it("001 密码式认证", async () => {
		await app.factory.create("users", {username:"user001", password:md5("123456")});

		const data = await app.httpRequest().post("/api/v0/oauth_apps/login").send({
			username:"user001",
			password:"123456",
		}).expect(200).then(res => res.body);
		assert(data.token);
	});

	it("002 认证码认证", async () => {
		await app.model.oauthApps.create({
			appName:"appname",
			userId:1,
			clientId: "123456",
			clientSecret:"abcdef",
			description:"oauth app test",
		});
		// 正常登陆
		const token = await app.login().then(o => o.token);
		assert(token);

		// 获取认证码
		const code = await app.httpRequest().get("/api/v0/oauth_apps/oauth_code?client_id=123456").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode)).then(res => res.body.code);
		assert(code);

		// 获取token
		const auth_token = await app.httpRequest().post("/api/v0/oauth_apps/oauth_token").send({client_id:"123456", client_secret:"abcdef", code:code}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode)).then(res => res.body.token);
		assert(auth_token);
	});
});
