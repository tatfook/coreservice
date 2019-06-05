const md5 = require("blueimp-md5");
const { app, mock, assert  } = require('egg-mock/bootstrap');
const initData = require("../data.js");

describe("lesson organization class", () => {
	let token = "";
	before(async () => {
		await initData(app);
	});

	it("001 班级结业与恢复", async() => {
		// 创建机构
		const organ = await app.model.lessonOrganizations.create({name:"org0000", count:1}).then(o => o.toJSON());

		// 创建班级
		let cls = await app.model.lessonOrganizationClasses.create({name:"clss000", organizationId: organ.id, begin: new Date(), end: new Date().getTime() + 1000 * 60 * 60 * 24}).then(o => o.toJSON());

		// 创建班级成员
		await app.model.lessonOrganizationClassMembers.create({organizationId:organ.id, memberId:1, roleId:1, classId: cls.id});

		// 登录机构
		const token = await app.httpRequest().post("/api/v0/lessonOrganizations/login").send({organizationId:1, username:"user001", password:"123456"}).expect(200).then(res => res.body.token).catch(e => console.log(e));

		// 结业班级
		await app.httpRequest().put("/api/v0/lessonOrganizationClasses/" + cls.id).send({end: "2019-01-01"}).set("Authorization", `Bearer ${token}`).expect(200).then(res => res.body.data).catch(e => console.log(e));
		cls = await app.model.lessonOrganizationClasses.findOne({where:{id:cls.id}}).then(o => o && o.toJSON());
		assert(new Date(cls.end).getTime() == new Date("2019-01-01").getTime());

		// 添加新成员
		await app.model.lessonOrganizationClassMembers.create({organizationId:organ.id, memberId:2, roleId:1, classId: cls.id});
		
		// 恢复结业班级
		await app.httpRequest().put("/api/v0/lessonOrganizationClasses/" + cls.id).send({end: "2040-01-01"}).set("Authorization", `Bearer ${token}`).expect((res) => {
			assert(res.statusCode == 400);
			//console.log(res.body);
		});
	});


	it("002 获取机构学生", async() => {
		const user = await app.model.users.create({username:"userxiaoyao", password: md5("123456")}).then(o => o.toJSON());
		const organ = await app.model.lessonOrganizations.create({name:"org1111", count:100}).then(o => o.toJSON());
		// 创建班级 student=3 teacher=2
		const cls1 = await app.model.lessonOrganizationClasses.create({name:"clss000", organizationId: organ.id, begin: new Date(), end: new Date().getTime() + 1000 * 60 * 60 * 24}).then(o => o.toJSON());
		// 班级2过期  student=2 teacher=1
		const cls2 = await app.model.lessonOrganizationClasses.create({name:"clss001", organizationId: organ.id, begin: new Date(), end: new Date().getTime() - 1000 * 60 * 60 * 24}).then(o => o.toJSON());
		const cls3 = await app.model.lessonOrganizationClasses.create({name:"clss002", organizationId: organ.id, begin: new Date(), end: new Date().getTime() + 1000 * 60 * 60 * 24}).then(o => o.toJSON());

		// 创建班级成员
		await app.model.lessonOrganizationClassMembers.create({organizationId:organ.id, memberId:user.id, roleId:64, classId: 0});
		await app.model.lessonOrganizationClassMembers.create({organizationId:organ.id, memberId:1, roleId:3, classId: cls1.id});
		await app.model.lessonOrganizationClassMembers.create({organizationId:organ.id, memberId:2, roleId:3, classId: cls2.id});
		await app.model.lessonOrganizationClassMembers.create({organizationId:organ.id, memberId:3, roleId:1, classId: cls3.id});
		
		// 登录机构
		const token = await app.httpRequest().post("/api/v0/lessonOrganizations/login").send({organizationId:organ.id, username:"userxiaoyao", password:"123456"}).expect(200).then(res => res.body.token).catch(e => console.log(e));

		// 获取学生
		let students = await app.httpRequest().get("/api/v0/lessonOrganizationClassMembers/student").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(students.count == 2);

		students = await app.httpRequest().get("/api/v0/lessonOrganizationClassMembers/student?classId=" + cls1.id).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(students.count == 1);

		let teachers = await app.httpRequest().get("/api/v0/lessonOrganizationClassMembers/teacher").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(teachers.length == 2);
	});

	it("003 机构过期测试", async() => {
		// 获取机构
		const organ = await app.model.lessonOrganizations.findOne({where:{id:1}}).then(o => o && o.toJSON());		
		// 验证机构的存在
		assert(organ);

		// 过期机构
		await app.model.lessonOrganizations.update({endDate:"2019-01-01"}, {where:{id:1}});

		const token = app.util.jwt_encode({userId:1, username:"user001", roleId:64, organizationId:1}, app.config.self.secret);
		assert(token);

		// 生成激活码
		await app.httpRequest().post("/api/v0/lessonOrganizationActivateCodes").set("Authorization", `Bearer ${token}`).send({classId:1, count:2}).expect(400).then(res => res.body);

		// 不过期机构
		await app.model.lessonOrganizations.update({endDate:"2119-01-01"}, {where:{id:1}});
		const list = await app.httpRequest().post("/api/v0/lessonOrganizationActivateCodes").set("Authorization", `Bearer ${token}`).send({classId:1, count:2}).expect(200).then(res => res.body);
		assert(list.length == 2);

		const usertoken = app.util.jwt_encode({userId:4, username:"user004"}, app.config.self.secret);
		const key = list[0].key;
		// 激活激活码
		const ok = await app.httpRequest().post("/api/v0/lessonOrganizationActivateCodes/activate").set("Authorization", `Bearer ${usertoken}`).send({key, organizationId:1}).expect(200).then(res => res.body).catch(e => console.log(e));
		assert(ok);
	});
});
