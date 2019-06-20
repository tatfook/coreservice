const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("NPL 大赛", () => {
	before(async () => {
	});

	it("001 大赛列表", async () => {
		await app.factory.createMany("users", 10);
		const user = await app.login();
		const userId = user.id;
		const token = user.token;

		const game = await app.model.games.create({gameNo:1, name:"game", stateDate: new Date().getTime() - 1000 * 60 * 60 * 24, endDate: new Date().getTime() + 1000 * 60 * 60 * 24});

		const p1 = await app.model.projects.create({userId, name:"project1"});
		const p2 = await app.model.projects.create({userId:2, name:"project2"});
		const p3 = await app.model.projects.create({userId:3, name:"project3"});
		const p4 = await app.model.projects.create({userId:4, name:"project4"});
		const p5 = await app.model.projects.create({userId:5, name:"project5"});
		const p6 = await app.model.projects.create({userId:6, name:"project6"});
		const p7 = await app.model.projects.create({userId, name:"project7"});

		await app.model.gameWorks.create({gameId: game.id, projectId: p1.id, userId,});
		await app.model.gameWorks.create({gameId: game.id, projectId: p2.id, userId:2,});
		await app.model.gameWorks.create({gameId: game.id, projectId: p3.id, userId:3,});
		await app.model.gameWorks.create({gameId: game.id, projectId: p4.id, userId:4,});
		await app.model.gameWorks.create({gameId: game.id, projectId: p5.id, userId:5,});
		await app.model.gameWorks.create({gameId: game.id, projectId: p6.id, userId:6,});

		const games = await app.httpRequest().post("/api/v0/games/search").expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(games.count == 1);

		const members = await app.httpRequest().get("/api/v0/games/members").expect(res => assert(res.statusCode == 200)).then(res => res.body);
		//assert(members.rows.length == 6);

		const projects = await app.httpRequest().get("/api/v0/games/projects").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(projects.length == 1);

		let works = await app.httpRequest().post("/api/v0/gameWorks/search").expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(works.count == 6);

		works = await app.httpRequest().get("/api/v0/gameWorks").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(works.length == 1);

		// 创建作品
		works = await app.httpRequest().post("/api/v0/gameWorks").send({gameId:game.id, projectId:p7.id, worksName:"test",}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);

		// 更新作品
		await app.httpRequest().put("/api/v0/gameWorks/" + works.id).send({gameId:game.id, projectId:p7.id, worksName:"test1",}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);

		// 获取作品
		works = await app.httpRequest().get("/api/v0/gameWorks/" + works.id).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(works.worksName == "test1");

		// 参赛作品统计
		const statistics = await app.httpRequest().get("/api/v0/gameWorks/statistics").set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(statistics);
		//console.log(statistics);
	});
});
