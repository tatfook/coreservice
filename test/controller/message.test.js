const { app, mock, assert  } = require('egg-mock/bootstrap');
const initData = require("../data.js");

describe("/users", () => {
	before(async () => {
		await initData(app);
	});

	it("拉取用户消息", async () => {
		const token = app.util.jwt_encode({userId:1, username:"user001"}, app.config.self.secret);

		const data = await app.httpRequest().get("/api/v0/userMessages").set("Authorization", `Bearer ${token}`).expect(200);
		assert(data);
	});
});
