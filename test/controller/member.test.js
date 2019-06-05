
const { app, mock, assert  } = require('egg-mock/bootstrap');
const initData = require("../data.js");

describe("成员", () => {
	before(async () => {
		await initData(app);
	});

	it("001 成员增删改查", async()=> {
		const token = await app.httpRequest().post("/api/v0/users/login").send({
			username:"user001",
			password:"123456",
		}).expect(res => assert(res.statusCode == 200)).then(res => res.body.token);

		const group = await app.httpRequest().post("/api/v0/groups").send({
			groupname:"group",
			description:"test",
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
	
		const objectType = 3;
		const objectId = group.id;

		const member1 = await app.httpRequest().post("/api/v0/members").send({
			objectType,
			objectId,
			memberId: 2,
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(member1.id);

		const member2 = await app.httpRequest().post("/api/v0/members").send({
			objectType,
			objectId,
			memberId: 3,
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(member2.id);

		let members = await app.httpRequest().get(`/api/v0/members?objectType=${objectType}&objectId=${objectId}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(members.length, 2);
		assert.ok(members[0].username);

		await app.httpRequest().delete(`/api/v0/members/${member2.id}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		members = await app.httpRequest().get(`/api/v0/members?objectType=${objectType}&objectId=${objectId}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(members.length, 1);

		await app.httpRequest().put(`/api/v0/members/${member1.id}`).send({level:32}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);

		const member = await app.httpRequest().get(`/api/v0/members/${member1.id}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(member.level, 32);
	});
});
