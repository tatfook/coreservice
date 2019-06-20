
const md5 = require("blueimp-md5");
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("graphql", () => {
	beforeEach(async () => {
		await app.model.users.bulkCreate([
			{
				username:"user001",
				password:md5("123456"),
			},
			{
				username:"user002",
				password:md5("123456"),
			},
			{
				username:"user003",
				password:md5("123456"),
			},
			{
				username:"user004",
				password:md5("123456"),
			},
			{
				username:"user005",
				password:md5("123456"),
			},
			{
				username:"user006",
				password:md5("123456"),
			},
		]);

		await app.model.lessonOrganizations.bulkCreate([
			{
				name:"org1",
				state:0,
				startDate: new Date(),
				endDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 30),
				count: 100,
			},
			{
				name:"org2",
				state:0,
				startDate: new Date(),
				endDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 30),
				count: 100,
			},
		]);

		await app.model.lessonOrganizationClasses.bulkCreate([
			{
				organizationId: 1,
				name: "class1",
				begin: new Date(),
				end: new Date(new Date().getTime() + 1000 * 60 * 60 * 30),
			},
			{
				organizationId: 1,
				name: "class2",
				begin: new Date(),
				end: new Date(new Date().getTime() + 1000 * 60 * 60 * 30),
			},
			{
				organizationId: 2,
				name: "class3",
				begin: new Date(),
				end: new Date(new Date().getTime() + 1000 * 60 * 60 * 30),
			},
			{
				organizationId: 1,
				name: "class4",
				begin: new Date("2019-01-01"),
				end: new Date("2019-04-01"),
			},
		]);

		await app.model.lessonOrganizationClassMembers.bulkCreate([
			{
				organizationId:1,
				classId: 0,
				roleId:64,
				memberId:1,
			},
			{
				organizationId:1,
				classId: 0,
				roleId:1,
				memberId:2,
			},
			{
				organizationId:1,
				classId: 0,
				roleId:2,
				memberId:3,
			},
			{
				organizationId:1,
				classId: 1,
				roleId:1,
				memberId:1,
			},
			{
				organizationId:1,
				classId: 1,
				roleId:2,
				memberId:2,
			},
			{
				organizationId:1,
				classId: 1,
				roleId:3,
				memberId:3,
			},
			{
				organizationId:1,
				classId: 4,
				roleId:3,
				memberId:2,
			},
		]);

		await app.model.lessonOrganizationPackages.bulkCreate([
			{
				organizationId:1,
				classId: 0,
				packageId: 1,
				lessons: [{lessonId:1, lessonNo:1}, {lessonId:2, lessonNo:2}],
			},
			{
				organizationId:1,
				classId: 0,
				packageId: 2,
				lessons: [{lessonId:2, lessonNo:1}, {lessonId:3, lessonNo:2}],
			},
		]);

		await app.lessonModel.packages.bulkCreate([
			{
				userId: 1,
				packageName:"pkg1",
				state:2,
			},
			{
				userId: 1,
				packageName:"pkg2",
				state:1,
			},
			{
				userId: 2,
				packageName:"pkg3",
				state:2,
			},
		]);

		await app.lessonModel.lessons.bulkCreate([
			{
				userId:1,
				lessonName:"lessonName1",
			},
			{
				userId:1,
				lessonName:"lessonName2",
			},
			{
				userId:1,
				lessonName:"lessonName3",
			},
			{
				userId:2,
				lessonName:"lessonName4",
			},
			{
				userId:2,
				lessonName:"lessonName5",
			},
		]);

		await app.lessonModel.packageLessons.bulkCreate([
			{
				userId:1,
				packageId: 1,
				lessonId:1,
			},
			{
				userId:1,
				packageId: 1,
				lessonId:2,
			},
			{
				userId:1,
				packageId: 2,
				lessonId:2,
			},
			{
				userId:1,
				packageId: 2,
				lessonId:3,
			},
			{
				userId:2,
				packageId: 3,
				lessonId:3,
			},
		]);

		await app.lessonModel.classrooms.bulkCreate([
			{
				userId:3,
				classId:1,
				packageId: 2,
				lessonId:2,
				key:"123456",
				state: 1,
			},
		]);
	});

	// 机构信息
	it("lesson organization", async () => {
		const data = await app.httpRequest().post("/api/v0/graphql").send({
			query: `query($id: Int, $name: String) {
				organization(id: $id, name: $name) {
					id, 
					studentCount, 
					teacherCount, 
					count, 
					students {
						organizationId
					},
					teachers {
						organizationId
					},
					organizationPackages {
						package {
							packageName,
						},
						lessons {
							lessonName,
						},
						lessonNos
					}
				}
			}`,
			variables: {
				id:1,
			},
		}).expect(200).then(res => res.body.data).catch(e => console.log(e));
	
		//console.log(JSON.stringify(data, undefined, 4));

		assert(data);
		assert(data.organization);
		assert(data.organization.id == 1);
		assert(data.organization.studentCount == 3);
		assert(data.organization.teacherCount == 2);
		assert(data.organization.students.length == 3);
		assert(data.organization.teachers.length == 4);
	});

	// 机构用户
	it("lesson organization user", async () => {
		const data = await app.httpRequest().post("/api/v0/graphql").send({
			query: `query($organizationId: Int, $userId: Int, $username: String) {
				organizationUser(organizationId: $organizationId, userId: $userId, username: $username) {
					organizationId,
					userId,
					organizationClasses {
						id, 
						begin,
						end,
						classrooms {
							id,
							state,
						},
						organization {
							name,
						},
						organizationPackages {
							packageId,
						},
					},
					organizationClassMembers {
						classId,
						roleId,
					}
				}
			}`,
			variables: {
				organizationId:1,
				userId:1,
				username:"",
			},
		}).expect(200).then(res => res.body.data).catch(e => console.log(e));

		assert(data);
		//console.log(JSON.stringify(data, undefined, 4));
	});

	//
});
