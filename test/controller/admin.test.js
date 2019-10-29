
const md5 = require("blueimp-md5");
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("管理员接口", () => {
	before(async () => {
	});

	it("001 管理员接口", async()=> {
		await app.factory.createMany("users", 10);
		await app.model.admins.create({username:"admin001", password: md5("123456")}).then(o => o.toJSON());

		// 登录
		let user = await app.httpRequest().post("/api/v0/admins/login").send({username:"admin001", password:"123456"}).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(user.token);
		const token = user.token;

		// 取用户token
		const userToken = await app.httpRequest().get("/api/v0/admins/userToken?userId=2").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(userToken);

		// sql查询
		const list = await app.model.users.findAll({where:{id:{$gt:0}}});
		const list1 = await app.httpRequest().get("/api/v0/admins/query?sql=select * from users where id > 0").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(list1.length == list.length);

		// 资源列表
		const list2 = await app.httpRequest().get("/api/v0/admins/users").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(list2.length == list.length);

		// 资源创建
		let resource = await app.httpRequest().post("/api/v0/admins/users").send({username:"user100", password:"xiaoyao", sex:"F"}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(resource.username == "user100");
		
		// 资源修改
		await app.httpRequest().put("/api/v0/admins/users/" + resource.id).send({sex:"M"}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		
		// 单一资源
		resource = await app.httpRequest().get("/api/v0/admins/users/" + resource.id).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(resource.sex == "M");

		// 删除
		await app.httpRequest().delete("/api/v0/admins/users/" + resource.id).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		//const data = app.model.users.findOne({})

		// 对项目增加标签
		let result = await app.httpRequest().post('/api/v0/admins/projects/1/systemTags').set("Authorization", `Bearer ${token}`).send({
			"tags": [
			  {
				"tagId": 1
			  },
			  {
				"tagId": 2
			  }
			]
		  }).expect(200).then(res => res.body);
		assert(result.length === 2 && result[0] === true && result[1] === true);
		await app.httpRequest().post('/api/v0/admins/projects/1/systemTags').set("Authorization", `Bearer ${token}`).expect(400);
		
		// 对项目修改标签顺序
		result = await app.httpRequest().put('/api/v0/admins/projects/1/systemTags/1').set("Authorization", `Bearer ${token}`)
		  .send({sn: 10}).expect(200).then(res => res.body);
		assert(result.length === 1 && result[0] === 1);
		await app.httpRequest().put('/api/v0/admins/projects/1/systemTags/aaa').set("Authorization", `Bearer ${token}`)
		  .send({sn: 10}).expect(400);

		// 对项目删除标签顺序
		result = await app.httpRequest().delete('/api/v0/admins/projects/1/systemTags').set("Authorization", `Bearer ${token}`)
		  .send({tagIds: [1,2]}).expect(200).then(res => res.body);
	    assert(result.length === 2 && result[0] === 1 && result[1] === 1);
	});
});
