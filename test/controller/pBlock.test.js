
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("paracraft 元件", () => {
	it("001 元件增删改查 使用", async () => {
		const token = await app.login().then(o => o.token);
		assert.ok(token);

		// 创建
		const block1 = await app.httpRequest().post("/api/v0/pBlocks").send({
			name:app.chance.string(),
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		const block2 = await app.httpRequest().post("/api/v0/pBlocks").send({
			name: app.chance.string(),
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);

		// 列表
		const list1 = await app.httpRequest().get("/api/v0/pBlocks").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(list1.length == 2);

		// 更新
		const blockId = block1.id;
		await app.httpRequest().put("/api/v0/pBlocks/" + blockId).send({fileUrl:"/test"}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);

		// 获取
		let block = await app.httpRequest().get("/api/v0/pBlocks/" + blockId).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(block.fileUrl == "/test");

		// 删除
		await app.httpRequest().delete("/api/v0/pBlocks/" + block2.id).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		// 列表
		const list2 = await app.httpRequest().get("/api/v0/pBlocks").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(list2.length == 1);

		// 更新使用次数
		await app.httpRequest().post("/api/v0/pBlocks/" + blockId + "/use").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		block = await app.httpRequest().get("/api/v0/pBlocks/" + blockId).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(block.useCount == 1);

		// 测试系统元件获取
		await app.httpRequest().get("/api/v0/pBlocks/system").expect(res => assert(res.statusCode == 200)).then(res => res.body);
	});
});
