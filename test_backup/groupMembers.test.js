
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("/groupMembers", () => {
	before(async () => {
		await app.model.users.truncate();
		await app.model.sites.truncate();
		await app.model.groups.truncate();
		await app.model.groupMembers.truncate();
		await app.model.siteGroups.truncate();

		let user = await app.httpRequest().post("/users/register").send({
			username:"xiaoyao",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);
		assert.ok(user.token);
		assert.equal(user.id, 1);

		user = await app.httpRequest().post("/users/register").send({
			username:"xianjian",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);
		assert.ok(user.token);
		assert.equal(user.id, 2);

		user = await app.httpRequest().post("/users/register").send({
			username:"wxatest",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);
		assert.ok(user.token);
		assert.equal(user.id, 3);

		let data = await app.httpRequest().post("/groups").send({
			groupname:"group1",
			description:"test",
		}).expect(200).then(res => res.body);
		assert.equal(data.id,1);
		
		data = await app.httpRequest().post("/groups").send({
			groupname:"group2",
			description:"test",
		}).expect(200).then(res => res.body);
		assert.equal(data.id,2);
	});

	it("POST|DELET|GET /groupMembers", async ()=> {
		let data = await app.httpRequest().post("/groupMembers").send({
			groupId:1,
			memberId:2,
		}).expect(200).then(res => res.body);
		assert.equal(data.id,1);

		data = await app.httpRequest().post("/groupMembers").send({
			groupId:1,
			memberId:3,
		}).expect(200).then(res => res.body);
		assert.equal(data.id,2);

		data = await app.httpRequest().get("/groupMembers").expect(200).then(res => res.body);
		assert.equal(data.length, 2);

		await app.httpRequest().delete("/groupMembers/1").expect(200);

		data = await app.httpRequest().get("/groupMembers").expect(200).then(res => res.body);
		assert.equal(data.length, 1);
	});
});
