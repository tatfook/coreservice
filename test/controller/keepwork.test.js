const md5 = require("blueimp-md5");
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
		assert(count === 1);

		// 获取页面访问量
		count = await app.httpRequest().get("/api/v0/keepworks/page_visit?url=www.baidu.com").expect(res => res.statusCode === 200).then(res => res.text);
		assert(count === "1");

		// 增加paracraft下载量
		await app.redis.set("paracraft_download_count",0);
		let downLoad = await app.httpRequest().post("/api/v0/keepworks/paracraft_download_count").expect(res=>res.statusCode === 200).then(res=> res.body);
		assert(downLoad === 1);

		// 获取paracraft下载量
		downLoad = await app.httpRequest().get("/api/v0/keepworks/paracraft_download_count").expect(res => res.statusCode === 200).then(res=>res.text);
		assert(downLoad === "1");

		// 创建用户
		await app.factory.createMany("users", 10);
		await app.model.admins.create({username:"admin001", password: md5("123456")}).then(o => o.toJSON());
		// 登录
		let user = await app.httpRequest().post("/api/v0/admins/login").send({username:"admin001", password:"123456"}).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(user.token);
		const token = user.token;
	
		// 设置paracraft下载地址
		let downLoadUrl = await app.httpRequest().post("/api/v0/keepworks/paracraft_download_url")
		.send({url:"www.bilibili.com"}).set("Authorization", `Bearer ${token}`)
		.expect(res => res.statusCode === 200).then(res => res.text);

		assert(downLoadUrl === "OK");

		// 获取paracraft下载地址
		downLoadUrl = await app.httpRequest().get("/api/v0/keepworks/paracraft_download_url").expect(res => res.statusCode ===200).then(res => res.body);
		assert(downLoadUrl.url === "www.bilibili.com");
	});
});
