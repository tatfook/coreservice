
const { app, mock, assert  } = require('egg-mock/bootstrap');
const {
	ENTITY_TYPE_USER,        // 用户类型
	ENTITY_TYPE_SITE,        // 站点类型
	ENTITY_TYPE_PAGE,        // 页面类型
	ENTITY_TYPE_GROUP,       // 组
	ENTITY_TYPE_ISSUE,       // 问题
	ENTITY_TYPE_PROJECT,     // 项目
} = require("../app/core/consts.js");

describe("issues", () => {
	before(async () => {
		await app.model.users.sync({force:true});
		await app.model.members.sync({force:true});
		await app.model.projects.sync({force:true});
		await app.model.issues.sync({force:true});
		await app.model.tags.sync({force:true});

		let data = await app.httpRequest().post("/users/register").send({
			username:"xiaoyao",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);
		assert.ok(data.token);
		assert.equal(data.id, 1);

		data = await app.httpRequest().post("/users/register").send({
			username:"wxaxiaoyao",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);
		assert.ok(data.token);

		data = await app.httpRequest().post("/users/register").send({
			username:"wxatest",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);
		assert.ok(data.token);

		data = await app.httpRequest().post("/projects").send({
			name:"projectname",
		}).expect(200).then(res => res.body);
		assert.equal(data.id,1);
	});

	it("POST|PUT|DELTE|GET /issues", async()=> {
		let data = await app.httpRequest().post("/issues").send({
			objectType:ENTITY_TYPE_PROJECT,
			objectId:1,
			title:"issue",
			content:"content",
			tags:["html", "go"],
			assigns: [2,3],
		}).expect(200).then(res => res.body);
		assert.equal(data.id,1);

		data = await app.httpRequest().post("/issues").send({
			objectType:ENTITY_TYPE_PROJECT,
			objectId:1,
			title:"issue2",
			content:"content2",
			tags:["html", "go"],
			assigns: [3],
		}).expect(200).then(res => res.body);
		assert.equal(data.id,2);

		data = await app.httpRequest().get("/issues").expect(200).then(res => res.body);
		assert.equal(data.length, 2);

		await app.httpRequest().delete("/issues/2").expect(200).then(res => res.body);
		data = await app.httpRequest().get("/issues").expect(200).then(res => res.body);
		assert.equal(data.length, 1);

		data = await app.httpRequest().put("/issues/1").send({content:"test", assigns:[2]}).expect(200).then(res => res.body);

		data = await app.httpRequest().get("/issues/1").expect(200).then(res => res.body);
		assert.equal(data.content, "test");
	});
});
