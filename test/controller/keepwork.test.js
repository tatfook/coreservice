
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("KEEPWORK", () => {
	before(async () => {
	});

	it("001 用户投诉 系统统计 敏感词列表 系统标签", async()=> {
		// 用户反馈
		await app.httpRequest().post("/api/v0/feedbacks").send({userId:1, username:"xiaoyao", type:0, url:"/index", description:"test"}).expect(res => res.statusCode == 200);
		// 系统统计
		await app.httpRequest().get("/api/v0/keepworks/statistics").expect(res => res.statusCode == 200).then(res => res.body);
		// 敏感词列表
		await app.httpRequest().get("/api/v0/keepworks/sensitiveWords").expect(res => res.statusCode == 200).then(res => res.body);
		// 系统标签
		await app.httpRequest().get("/api/v0/systemTags?classify=1").expect(res => res.statusCode == 200).then(res => res.body);
	});

	it("002 parcraft 下载量 下载地址 页面访问量", async () => {
		await app.redis.set("www.baidu.com-page-visit-count", 0);
		// 增加页面访问量
		let count = await app.httpRequest().post("/api/v0/keepworks/page_visit").send({ url:"www.baidu.com" }).expect(res => res.statusCode === 200).then(res => res.body);
		assert(count == 1);

		// 获取页面访问量
		count = await app.httpRequest().get("/api/v0/keepworks/page_visit?url=www.baidu.com").expect(res => res.statusCode == 200).then(res => res.text);
		assert(count == "1");
	});
});
