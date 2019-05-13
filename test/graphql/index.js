
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("graphql", () => {
	before(async () => {
		mock.consoleLevel('DEBUG');
		await app.model.users.sync({force:true});
		await app.model.lessonOrganizations.sync({force:true});
		await app.model.lessonOrganizationClasses.sync({force:true});
		await app.model.lessonOrganizationClassMembers.sync({force:true});
		await app.model.lessonOrganizationPackages.sync({force:true});

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

		await app.model.lessonOrganizations.create({
			userId:1, 
			name:"organization",
		})
	});

	// 获取机构用户
	it("lesson organization user", async () => {
		const data = await app.httpRequest().post("/api/v0/graphql").send({
			query: `query($id: Int, $name: String) {organization(id: $id, name: $name) {id, studentCount, teacherCount, count }}`,
			variables: {
				id:1,
			}
		}).expect(200).then(res => res.body);
		console.log(data);
	});
});
