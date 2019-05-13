
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("graphql", () => {
	before(async () => {
		//mock.consoleLevel('DEBUG');
		// 初始化相关数据表
		await app.model.users.sync({force:true});
		await app.model.lessonOrganizations.sync({force:true});
		await app.model.lessonOrganizationClasses.sync({force:true});
		await app.model.lessonOrganizationClassMembers.sync({force:true});
		await app.model.lessonOrganizationPackages.sync({force:true});

		// 构建3个用户
		await app.model.users.bulkCreate([{
			username:"xiaoyao",
			password:"wuxiangan",
		}, {
			username:"wxatest",
			password:"wuxiangan",
		}, {
			username:"wxaxiaoyao",
			password:"wuxiangan",
		}]);

		// 创建机构  id = 1 
		await app.model.lessonOrganizations.create({
			userId:1, 
			name:"organization",
		});

		// 添加老师和学生
		await app.model.lessonOrganizationClassMembers.bulkCreate([
		{
			organizationId:1,
			classId: 0,
			roleId:1,
			memberId:1,
		},
		{
			organizationId:1,
			classId: 0,
			roleId:2,
			memberId:2,
		},
		{
			organizationId:1,
			classId: 1,
			roleId:3,
			memberId:3,
		},
		]);
	});

	// 获取机构用户
	it("lesson organization user", async () => {
		const data = await app.httpRequest().post("/api/v0/graphql").send({
			query: `query($id: Int, $name: String) {organization(id: $id, name: $name) {id, studentCount, teacherCount, count, students{userId} }}`,
			variables: {
				id:1,
			}
		}).expect(200).then(res => res.body.data);
		console.log(data);
	});
});
