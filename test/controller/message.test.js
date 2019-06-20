const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("/users", () => {
	before(async () => {
	});

	it("拉取用户消息", async () => {
		const user = await app.login();
		const userId = user.id;
		const token = user.token;

		await app.model.messages.create({all:1});
		await app.model.messages.create({all:1});
		await app.model.messages.create({all:1});
		await app.model.messages.create({all:1});
		await app.model.messages.create({all:1});
		await app.model.messages.create({all:1});

		await app.model.userMessages.create({userId, messageId:1, state:0});
		await app.model.userMessages.create({userId, messageId:2, state:0});
		await app.model.userMessages.create({userId, messageId:3, state:0});
		await app.model.userMessages.create({userId, messageId:4, state:0});
		await app.model.userMessages.create({userId, messageId:5, state:0});
		await app.model.userMessages.create({userId:2, messageId:6, state:0});

		let data = await app.httpRequest().get("/api/v0/userMessages").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(data.count == 5);

		// 标记1,2,3已读
		await app.httpRequest().post("/api/v0/userMessages/state").send({ids:[1,2,3], state:1}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);

		data = await app.httpRequest().get("/api/v0/userMessages?state=0").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(data.count == 2);
		
		// 标记全部已读
		await app.httpRequest().post("/api/v0/userMessages/allstate").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);

		data = await app.httpRequest().get("/api/v0/userMessages?state=0").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(data.count == 0);
	});
});
