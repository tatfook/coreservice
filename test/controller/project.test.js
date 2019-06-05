
const { app, mock, assert  } = require('egg-mock/bootstrap');
const initData = require("../data.js");

describe("/projects", () => {
	before(async () => {
		await initData(app);
	});

	it("POST|PUT|DELETE|GET /projects", async ()=> {
		const token = await app.httpRequest().post("/api/v0/users/login").send({
			username:"user001",
			password:"123456",
		}).expect(res => assert(res.statusCode == 200)).then(res => res.body.token);
		assert.ok(token);

		const project = await app.httpRequest().post("/api/v0/projects").send({
			name:"projectname1",
			type:0,
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(project.id,1);
		const projectId = project.id;
		
		let data = await app.httpRequest().get(`/api/v0/projects/${projectId}/visit`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		data = await app.model.projects.findOne({where: {id: projectId}});
		assert.equal(data.id, 1);
		assert.equal(data.visit, 1);
		
		data = await app.httpRequest().post(`/api/v0/projects/${projectId}/star`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		data = await app.httpRequest().get(`/api/v0/projects/${projectId}/visit`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		data = await app.model.projects.findOne({where: {id: projectId}});
		assert.equal(data.visit, 2);
		assert.equal(data.star, 1);

		data = await app.httpRequest().post(`/api/v0/projects/${projectId}/unstar`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		data = await app.httpRequest().get(`/api/v0/projects/${projectId}/visit`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		data = await app.model.projects.findOne({where: {id: projectId}});
		assert.equal(data.visit, 3);
		assert.equal(data.star, 0);
	});
});
