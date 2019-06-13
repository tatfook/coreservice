
const { app, mock, assert  } = require('egg-mock/bootstrap');
const initData = require("../data.js");

describe("/applies", () => {
	before(async () => {
		await initData(app);
	});

	it("POST|PUT|DELETE|GET /applies", async()=> {
		const token = await app.httpRequest().post("/api/v0/users/login").send({
			username:"user001",
			password:"123456",
		}).expect(res => assert(res.statusCode == 200)).then(res => res.body.token);
		assert.ok(token);

		// 创建项目
		let project = await app.httpRequest().post("/api/v0/projects").send({
			name:"projectname1",
			type:0,
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(project.id);

		let objectType = 5;
		let objectId = project.id;

		// 创建申请
		const apply1 = await app.httpRequest().post("/api/v0/applies").send({
			objectType,
			objectId,
			applyType: 0,
			applyId: 2,
			legend:"申请加入项目",
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(apply1.id);
		
		// 创建申请
		const apply2 = await app.httpRequest().post("/api/v0/applies").send({
			objectType,
			objectId,
			applyType: 0,
			applyId: 3,
			legend:"申请加入项目",
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(apply2.id);

		// 获取申请列表
		let data = await app.httpRequest().get(`/api/v0/applies?objectType=${objectType}&objectId=${objectId}&applyType=0`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(data.length, 2);

		//const token1 = app.util.jwt_encode({userId:2, username:'user002'}, app.config.self.secret);
		//const token2 = app.util.jwt_encode({userId:3, username:'user003'}, app.config.self.secret);
		// 同意
		await app.httpRequest().put(`/api/v0/applies/${apply1.id}`).set("Authorization", `Bearer ${token}`).send({state:1}).expect(res => assert(res.statusCode == 200));
		// 拒绝
		await app.httpRequest().put(`/api/v0/applies/${apply2.id}`).set("Authorization", `Bearer ${token}`).send({state:2}).expect(res => assert(res.statusCode == 200));

		// 获取对象成员验证
		data = await app.httpRequest().get(`/api/v0/members?objectType=${objectType}&objectId=${objectId}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(data.length, 2); // 创建者自己和同意加入一个人
		//console.log(data);
		
		// 获取指定对象
		data = await app.httpRequest().get(`/api/v0/applies/${apply2.id}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert.equal(data.state, 2);
		
		// 获取申请状态
		data = await app.httpRequest().get(`/api/v0/applies/state?objectType=${objectType}&objectId=${objectId}&applyId=3&applyType=0`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(data == 2)
	});
});
