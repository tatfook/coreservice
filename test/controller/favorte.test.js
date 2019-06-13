
const { app, mock, assert  } = require('egg-mock/bootstrap');
const initData = require("../data.js");

describe("关注收藏", () => {
	before(async () => {
		await initData(app);
	});

	it("001 用户关注 是否关注 获取收藏列表 获取收藏用户 取消收藏", async()=> {
		const user = await app.httpRequest().post("/api/v0/users/login").send({
			username:"user001",
			password:"123456",
		}).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		const token = user.token;
		const userId = user.id;

		// 用户
		let objectType = 0;
		let objectId = 2;
		// 关注用户
		let data = await app.httpRequest().post("/api/v0/favorites").send({
			objectType,
			objectId,
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(data.id);

		// 是否关注
		data = await app.httpRequest().get(`/api/v0/favorites/exist?objectId=${objectId}&objectType=${objectType}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.ok(data);

		// 获取关注列表
		data = await app.httpRequest().get(`/api/v0/favorites?objectType=${objectType}&userId=${userId}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(data.length, 1);
		assert.equal(data[0].id, objectId);

		// 搜索
		data = await app.httpRequest().post("/api/v0/favorites/search").send({objectId, objectType}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(data.count, 1);

		// 获取粉丝
		data = await app.httpRequest().get(`/api/v0/favorites/follows?objectId=${objectId}&objectType=${objectType}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(data.length,1);
		assert.equal(data[0].username, "user001");

		// 取消关注
		data = await app.httpRequest().delete(`/api/v0/favorites?objectId=${objectId}&objectType=${objectType}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);

		data = await app.httpRequest().get(`/api/v0/favorites?objectType=${objectType}&userId=${userId}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(data.length, 0);
		
		// 站点
		const site = await app.model.sites.create({userId:2,sitename:"site2"});
		objectType = 1;
		objectId = site.id;
		// 关注用户
		data = await app.httpRequest().post("/api/v0/favorites").send({
			objectType,
			objectId,
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(data.id);

		// 是否关注
		data = await app.httpRequest().get(`/api/v0/favorites/exist?objectId=${objectId}&objectType=${objectType}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.ok(data);

		// 获取关注列表
		data = await app.httpRequest().get(`/api/v0/favorites?objectType=${objectType}&userId=${userId}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(data.length, 1);
		assert.equal(data[0].id, objectId);

		// 搜索
		data = await app.httpRequest().post("/api/v0/favorites/search").send({objectId, objectType}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(data.count, 1);

		// 获取粉丝
		data = await app.httpRequest().get(`/api/v0/favorites/follows?objectId=${objectId}&objectType=${objectType}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(data.length,1);
		assert.equal(data[0].username, "user001");

		// 取消关注
		data = await app.httpRequest().delete(`/api/v0/favorites?objectId=${objectId}&objectType=${objectType}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);

		data = await app.httpRequest().get(`/api/v0/favorites?objectType=${objectType}&userId=${userId}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(data.length, 0);
	});
});
