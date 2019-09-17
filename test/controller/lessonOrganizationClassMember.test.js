
const md5 = require("blueimp-md5");
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("机构学生", () => {
	before(async () => {
	});

	it("001 机构学生添加接口测试", async() => {
		const user = await app.login();

		// 创建机构
		const organ = await app.model.lessonOrganizations.create({name:"org0000", count:1}).then(o => o.toJSON());

		const token = app.token({userId: user.id, username: user.username, organizationId: organ.id, roleId: 64});

		// 创建班级
		let cls = await app.model.lessonOrganizationClasses.create({name:"clss000", organizationId: organ.id, begin: new Date(), end: new Date().getTime() + 1000 * 60 * 60 * 24}).then(o => o.toJSON());
		let cls1 = await app.model.lessonOrganizationClasses.create({name:"clss001", organizationId: organ.id, begin: new Date(), end: new Date().getTime() + 1000 * 60 * 60 * 24}).then(o => o.toJSON());
		let cls2 = await app.model.lessonOrganizationClasses.create({name:"clss002", organizationId: organ.id, begin: new Date(), end: new Date().getTime() + 1000 * 60 * 60 * 24}).then(o => o.toJSON());

		// 添加为管理员
		await app.model.lessonOrganizationClassMembers.create({organizationId:organ.id, memberId:user.id, roleId:64, classId: 0});

		// 测试接口添加学生
		let members = await app.httpRequest().post("/api/v0/lessonOrganizationClassMembers").send({memberId: 2, organizationId: organ.id, classIds:[cls.id, cls1.id, cls2.id], roleId:1}).set("Authorization", `Bearer ${token}`).expect(200).then(res => res.body).catch(e => console.log(e));
		assert(members.length == 3);
		members = await app.httpRequest().post("/api/v0/lessonOrganizationClassMembers").send({memberId: 2, organizationId: organ.id, classIds:[cls.id, cls1.id, cls2.id], roleId:2}).set("Authorization", `Bearer ${token}`).expect(200).then(res => res.body).catch(e => console.log(e));

		//// 删除班级成员
		await app.httpRequest().delete("/api/v0/lessonOrganizationClassMembers/" + members[0].id + "?roleId=2").set("Authorization", `Bearer ${token}`).expect(200).then(res => res.body).catch(e => console.log(e));
		await app.httpRequest().delete("/api/v0/lessonOrganizationClassMembers/" + members[0].id + "?roleId=1").set("Authorization", `Bearer ${token}`).expect(200).then(res => res.body).catch(e => console.log(e));
	});
});
