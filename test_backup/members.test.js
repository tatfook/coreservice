
const { app, mock, assert  } = require('egg-mock/bootstrap');
const {
	ENTITY_TYPE_USER,        // 用户类型
	ENTITY_TYPE_SITE,        // 站点类型
	ENTITY_TYPE_PAGE,        // 页面类型
	ENTITY_TYPE_GROUP,       // 组
	ENTITY_TYPE_ISSUE,       // 问题
	ENTITY_TYPE_PROJECT,     // 项目
} = require("../app/core/consts.js");

describe("members", () => {
	let data = undefined;

	before(async () => {
		await app.model.users.sync({force:true});
		await app.model.members.sync({force:true});
		await app.model.projects.sync({force:true});

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

	it("POST|PUT|DELTE|GET /members", async()=> {
		data = await app.httpRequest().post("/members").send({
			objectType:ENTITY_TYPE_PROJECT,
			objectId:1,
			memberId: 2,
		}).expect(200).then(res => res.body);
		assert.equal(data.id,1);

		data = await app.httpRequest().post("/members").send({
			objectType:ENTITY_TYPE_PROJECT,
			objectId:1,
			memberId: 3,
		}).expect(200).then(res => res.body);
		assert.equal(data.id,2);

		data = await app.httpRequest().get("/members?objectType=5&objectId=1").expect(200).then(res => res.body);
		assert.equal(data.length, 2);
		assert.ok(data[0].username);

		await app.httpRequest().delete("/members/2").expect(200).then(res => res.body);
		data = await app.httpRequest().get("/members?objectType=5&objectId=1").expect(200).then(res => res.body);
		assert.equal(data.length, 1);

		data = await app.httpRequest().put("/members/1").send({level:32}).expect(200).then(res => res.body);

		data = await app.httpRequest().get("/members/1").expect(200).then(res => res.body);
		assert.equal(data.level, 32);
	});
});
