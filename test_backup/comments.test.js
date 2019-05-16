
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("/comments", () => {
	before(async () => {
		await app.model.users.truncate();
		await app.model.comments.truncate();

		let data = await app.httpRequest().post("/users/register").send({
			username:"xiaoyao",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);
		assert.ok(data.token);
		assert.equal(data.id, 1);
	});

	it("POST|PUT|DELTE|GET /comments", async()=> {
		let data = await app.httpRequest().post("/comments").send({
			objectType:2,
			objectId:1,
			content: "hello comment 1"
		}).expect(200).then(res => res.body);
		assert.equal(data.id,1);

		data = await app.httpRequest().post("/comments").send({
			objectType:2,
			objectId:1,
			content: "hello comment 2"
		}).expect(200).then(res => res.body);
		assert.equal(data.id,2);

		data = await app.httpRequest().get("/comments").expect(200).then(res => res.body);
		assert.equal(data.length, 2);

		await app.httpRequest().delete("/comments/2").expect(200).then(res => res.body);
		data = await app.httpRequest().get("/comments").expect(200).then(res => res.body);
		assert.equal(data.length, 1);

		data = await app.httpRequest().put("/comments/1").send({content:"test"}).expect(200).then(res => res.body);

		data = await app.httpRequest().get("/comments/1").expect(200).then(res => res.body);
		assert.equal(data.content, "test");
	});
});
