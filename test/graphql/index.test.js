
const { app, mock, assert  } = require('egg-mock/bootstrap');

const initData = require("../data.js");

describe("graphql", () => {
	before(async () => {
		await initData(app);
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
