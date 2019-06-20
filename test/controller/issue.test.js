
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("issues", () => {
	before(async () => {
	});

	it("POST|PUT|DELTE|GET /issues", async()=> {
		const token = await app.login().then(o => o.token);
		assert.ok(token);

		// 创建项目
		let project = await app.httpRequest().post("/api/v0/projects").send({
			name:"projectname1",
			type:0,
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(project.id);
		
		let objectType = 5;
		let objectId = project.id;

		const issue1 = await app.httpRequest().post("/api/v0/issues").send({
			objectType,
			objectId,
			title:"issue",
			content:"content",
			tags:"|html|go|",
			assigns: "|2|3|",
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(issue1.id);

		const issue2 = await app.httpRequest().post("/api/v0/issues").send({
			objectType,
			objectId,
			title:"issue2",
			content:"content2",
			assigns: "|3|",
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(issue2.id);

		let issues = await app.httpRequest().get(`/api/v0/issues?objectType=${objectType}&objectId=${objectId}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(issues.length, 2);

		issues = await app.httpRequest().post(`/api/v0/issues/search`).send({objectType, objectId}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(issues.count, 2);

		let statistics = await app.httpRequest().get(`/api/v0/issues/statistics?objectType=${objectType}&objectId=${objectId}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(statistics[0].state==0);
		assert(statistics[0].count==2);

		await app.httpRequest().delete(`/api/v0/issues/${issue2.id}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		issues = await app.httpRequest().get(`/api/v0/issues?objectType=${objectType}&objectId=${objectId}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(issues.length, 1);

		await app.httpRequest().put(`/api/v0/issues/${issue1.id}`).set("Authorization", `Bearer ${token}`).send({content:"test", assigns:"|2|"}).expect(res => assert(res.statusCode == 200)).then(res => res.body);

		let data = await app.httpRequest().get(`/api/v0/issues/${issue1.id}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(data.content, "test");
	});
});
