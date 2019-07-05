
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

	});

	it("002 元件分类", async () => {
		// 测试系统元件获取
		const classify1 = await app.model.pClassifies.create({name:"classify1"});
		const classify2 = await app.model.pClassifies.create({name:"classify2"});
		const classify3 = await app.model.pClassifies.create({name:"classify3", parentId: classify1.id});

		const block1 = await app.model.pBlocks.create({name:"block1"});
		const block2 = await app.model.pBlocks.create({name:"block2"});
		const block3 = await app.model.pBlocks.create({name:"block3"});

		app.model.pBlockClassifies.create({classifyId: classify1.id, blockId: block2.id});
		app.model.pBlockClassifies.create({classifyId: classify3.id, blockId: block1.id});
		app.model.pBlockClassifies.create({classifyId: classify2.id, blockId: block3.id});
		
		// 测试系统元件获取
		const blocks = await app.httpRequest().get("/api/v0/pBlocks/system").expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(blocks.length == 3);

		const classify = await app.httpRequest().get("/api/v0/pBlocks/systemClassifies").expect(res => assert(res.statusCode == 200)).then(res => res.body);
		//console.log(JSON.stringify(classify, null, 4));
	});

	it("003 管理员接口", async () => {
		const token = await app.adminLogin().then(data => data.token);

		// 资源创建
		await app.httpRequest().post("/api/v0/admins/pBlocks").send({userId:1, pClassifies:[{id:1}]}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		const count = await app.model.pBlockClassifies.count({});
		assert(count == 1);
	});
});
