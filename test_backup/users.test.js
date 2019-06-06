
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("/users", () => {
	before(async () => {
		await app.model.users.sync({force:true});
		await app.model.oauthUsers.sync({force:true});

		app.model.oauthUsers.create({
			externalId:"123456",
			type:1,
			token: "oauth_token",
		});
		//done();
	});

	it("/users/register|login", async ()=> {
		let user = await app.httpRequest().post("/users/register").send({
			username:"xiaoyao",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);

		assert.ok(user.token);
		assert.equal(user.id, 1);

		user = await app.httpRequest().post("/users/login").send({
			username:"xiaoyao",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);
		assert.ok(user.token);

		
		//done();
	});

	it("register with cellphone oauthToken", async ()=> {
		const cellphone="cellphoneregister";
		let data = await app.httpRequest().get("/users/cellphone_captcha?cellphone=" + cellphone).expect(200);
		const cache = app.cache.get(cellphone) || {};
		assert.ok(cache.captcha);

		let user = await app.httpRequest().post("/users/register").send({
			username:"wxatest",
			password:"wuxiangan",
			cellphone,
			cellphoneCaptcha: cache.captcha,
			oauthToken: "oauth_token",
		}).expect(200).then(res => res.body);
		assert.ok(user.token);
		assert.equal(user.cellphone, cellphone);

		const oauthUser = await app.model.oauthUsers.findOne({where:{token:"oauth_token"}});
		assert.equal(oauthUser.userId, user.id);
	});

	it("PUT|GET /users/1", async ()=> {
		const url = "/users/1";
		const ok = await app.httpRequest().put(url).send({
			sex:"M",
		}).expect(200);

		let user = await app.httpRequest().get(url).expect(200).then(res => res.body);

		assert.equal(user.sex, "M");

		//done();
	});

	it ("/users/changepwd", async ()=> {
		let data = await app.httpRequest().put("/users/pwd").send({
			oldpassword:"wuxiangan",
			password:"123456",
		}).expect(200);

		data = await app.httpRequest().post("/users/login").send({
			username:"xiaoyao",
			password:"123456",
		}).expect(200).then(res => res.body);

		assert.ok(data.token);

		//done();
	});

});
