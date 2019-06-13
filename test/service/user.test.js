const md5 = require("blueimp-md5");

const { app, mock, assert  } = require('egg-mock/bootstrap');
const initData = require("../data.js");

describe("/users", () => {
	before(async () => {
		await initData(app);
	});

	it("用户注册", async () => {
		const ctx = app.mockContext();

		const um = await ctx.service.user.createRegisterMsg({id:1, username:"user0001"});

		assert(um);
	});
});
