
const { app, mock, assert  } = require('egg-mock/bootstrap');
const initData = require("../data.js");

describe("KEEPWORK", () => {
	before(async () => {
		await initData(app);
	});

	it("用户投诉 系统统计 敏感词列表", async()=> {
		// 用户反馈
		await app.httpRequest().post("/api/v0/feedbacks").send({userId:1, username:"xiaoyao", type:0, url:"/index", description:"test"}).expect(res => res.statusCode == 200);
		// 系统统计
		await app.httpRequest().get("/api/v0/keepworks/statistics").expect(res => res.statusCode == 200).then(res => res.body);
		// 敏感词列表
		await app.httpRequest().get("/api/v0/keepworks/sensitiveWords").expect(res => res.statusCode == 200).then(res => res.body);
	});
});
