
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("oauth user", () => {
	before(async ()=>{
		await app.model.oauthUsers.truncate();
	});

	it("github oauth", async ()=> {
		let data = await app.httpRequest().post("/oauth_users/github").send({
			clientId:"xx",
			redirectUri:"xx",
			code:"xx",
			state:"bind",
		}).expect(200).then(res => res.body);

		assert.ok(data.token);
		assert.ok(data.id == undefined);

		data = await app.httpRequest().post("/oauth_users/github").send({
			clientId:"xx",
			redirectUri:"xx",
			code:"xx",
			state:"login",
		}).expect(200).then(res => res.body);

		assert.ok(data.token);
		assert.ok(data.id);
	});
});
