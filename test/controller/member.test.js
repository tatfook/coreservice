
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("成员", () => {
	before(async () => {
	});

	it("001 成员增删改查 批量创建成员 成员是否存在", async()=> {
		await app.factory.createMany("users", 10);
		const token = await app.login().then(o => o.token);

		const group = await app.httpRequest().post("/api/v0/groups").send({
			groupname:"group",
			description:"test",
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
	
		const objectType = 3;
		const objectId = group.id;

		// 批量创建成员
		await app.httpRequest().post("/api/v0/members/bulk").send({
			objectType,
			objectId,
			memberIds:[4,5],
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);

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
		assert.equal(members.length, 4);
		assert.ok(members[0].username);

		await app.httpRequest().delete(`/api/v0/members/${member2.id}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		members = await app.httpRequest().get(`/api/v0/members?objectType=${objectType}&objectId=${objectId}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(members.length, 3);

		await app.httpRequest().put(`/api/v0/members/${member1.id}`).send({level:32}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);

		const member = await app.httpRequest().get(`/api/v0/members/${member1.id}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(member.level, 32);

		// 判断成员是否存在
		let exist = await app.httpRequest().get(`/api/v0/members/exist`).send({objectId, objectType, memberId:2}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(exist);

		exist = await app.httpRequest().get(`/api/v0/members/exist`).send({objectId, objectType, memberId:12}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(!exist);
	});
});
