const { app, mock, assert  } = require('egg-mock/bootstrap');
const initData = require("../data.js");

describe("组", () => {
	before(async () => {
		await initData(app);
	});

	it("001 组的增删查改", async ()=> {
		const token = await app.httpRequest().post("/api/v0/users/login").send({
			username:"user001",
			password:"123456",
		}).expect(res => assert(res.statusCode == 200)).then(res => res.body.token);
		assert.ok(token);
		const group1 = await app.httpRequest().post("/api/v0/groups").send({
			groupname:"group1",
			description:"test",
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(group1.id);
		
		const group2 = await app.httpRequest().post("/api/v0/groups").send({
			groupname:"group2",
			description:"test",
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(group2.id);

		const groups = await app.httpRequest().get("/api/v0/groups").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(groups.length, 2);

		await app.httpRequest().put(`/api/v0/groups/${group1.id}`).send({description:"description"}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200));

		let data = await app.httpRequest().get(`/api/v0/groups/${group1.id}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(data.description, "description");

		await app.httpRequest().delete(`/api/v0/groups/${group2.id}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		 
		data = await app.httpRequest().get("/api/v0/groups").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(data.length, 1);
	});

	it("002 组成员增删改查", async()=>{
		const token = await app.httpRequest().post("/api/v0/users/login").send({
			username:"user001",
			password:"123456",
		}).expect(res => assert(res.statusCode == 200)).then(res => res.body.token);
		assert.ok(token);
		const group = await app.httpRequest().post("/api/v0/groups").send({
			groupname:"group3",
			description:"test",
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(group.id);
		const url = `/api/v0/groups/${group.id}/members`;

		// 添加组成员
		let data = await app.httpRequest().post(url).send({
			memberName:"user002",
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(data.id);
		
		data = await app.httpRequest().post(url).send({
			memberName:"user003",
			description:"test",
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(data.id);

		// 获取组成员
		data = await app.httpRequest().get(url).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(data.length, 2);
		assert.equal(data[0].username, "user002");
		assert.equal(data[1].username, "user003");

		data = await app.httpRequest().delete(url+"?memberName=user003").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200));

		data = await app.httpRequest().get(url).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		//console.log(data);
		assert.equal(data.length, 1);
		assert.equal(data[0].username, "user002");
	});
});
