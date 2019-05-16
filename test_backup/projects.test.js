
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("/projects", () => {
	before(async () => {
		await app.model.users.sync({force:true});
		await app.model.projects.sync({force:true});
		await app.model.worlds.sync({force:true});

		//let data = await app.httpRequest().post("/users/register").send({
			//username:"xiaoyao",
			//password:"wuxiangan",
		//}).expect(200).then(res => res.body);
		//assert.ok(data.token);
		//assert.equal(data.id, 1);

		//data = await app.httpRequest().post("/users/register").send({
			//username:"wxaxiaoyao",
			//password:"wuxiangan",
		//}).expect(200).then(res => res.body);
		//assert.ok(data.token);

		//data = await app.httpRequest().post("/users/register").send({
			//username:"wxatest",
			//password:"wuxiangan",
		//}).expect(200).then(res => res.body);
		//assert.ok(data.token);

	});

	it("POST|PUT|DELETE|GET /projects", async ()=> {
		let data = await app.httpRequest().post("/projects").send({
			name:"projectname1",
			type:1,
		}).expect(200).then(res => res.body);
		assert.equal(data.id,1);
		
		//data = await app.httpRequest().get("/projects/1/visit").expect(200).then(res => res.body);
		//assert.equal(data.id, 1);
		//assert.equal(data.visit, 1);
		
		//data = await app.httpRequest().post("/projects/1/star").expect(200).then(res => res.body);
		//data = await app.httpRequest().get("/projects/1/visit").expect(200).then(res => res.body);
		//assert.equal(data.visit, 2);
		//assert.equal(data.star, 1);

		//data = await app.httpRequest().post("/projects/1/unstar").expect(200).then(res => res.body);
		//data = await app.httpRequest().get("/projects/1/visit").expect(200).then(res => res.body);
		//assert.equal(data.visit, 3);
		//assert.equal(data.star, 0);
	});
});
