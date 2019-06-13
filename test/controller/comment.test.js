
const { app, mock, assert  } = require('egg-mock/bootstrap');
const initData = require("../data.js");

describe("评论", () => {
	before(async () => {
		await initData(app);
	});

	it("001 评论的增删查改", async()=> {
		const token = await app.httpRequest().post("/api/v0/users/login").send({
			username:"user001",
			password:"123456",
		}).expect(res => assert(res.statusCode == 200)).then(res => res.body.token);
		assert.ok(token);

		const objectType = 2;
		const objectId = 1;

		const comment1 = await app.httpRequest().post("/api/v0/comments").send({
			objectType,
			objectId,
			content: "hello comment 1"
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(comment1.id);

		const comment2 = await app.httpRequest().post("/api/v0/comments").send({
			objectType,
			objectId,
			content: "hello comment 2"
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(comment2.id);

		let comments = await app.httpRequest().get("/api/v0/comments").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(comments.count, 2);

		await app.httpRequest().delete(`/api/v0/comments/${comment2.id}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		comments = await app.httpRequest().get("/api/v0/comments").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(comments.count, 1);

		await app.httpRequest().put(`/api/v0/comments/${comment1.id}`).send({content:"test"}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);

		const data = await app.httpRequest().get("/api/v0/comments/1").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(data.content, "test");
	});
});
