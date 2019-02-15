const joi = require("joi");
const _ = require("lodash");
const worlds = require("./worlds.js");

const { ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_PROJECT,

	ENTITY_VISIBILITY_PUBLIC,
	ENTITY_VISIBILITY_PRIVATE,

	PROJECT_TYPE_SITE,
	PROJECT_TYPE_PARACRAFT,
} = require("../core/consts.js");
const Controller = require("../core/controller.js");

const Project = class extends Controller {
	get modelName() {
		return "projects";
	}

	// 创建3D 实现3D世界相关的文件的创建  
	// project 对象项目记录对象
	async createWorld(project) {
		const worldName = project.name;  // 世界名
		const projectId = project.id;    // 项目ID
		const userId = project.userId;   // 用户ID

		const data = await this.ctx.service.world.generateDefaultWorld(worldName);
		console.log(data ? `创建世界成功:${worldName}` : `创建世界失败:${worldName}`);
		if (!data) {
			await this.model.projects.destroy({where:{id:projectId}});
			return false;
		};
		try {
			await this.model.worlds.create({worldName, projectId, userId});
			//await this.model.projects.update({status:2}, {where:{id:projectId}});
		} catch(e) {
		}

		return true;
	}

	async destroyWorld(project) {
		const worldName = project.name;  // 世界名
		const projectId = project.id;    // 项目ID
		const userId = project.userId;   // 用户ID
		
		await this.model.worlds.destroy({where:{projectId, userId}});

		await this.ctx.service.world.removeProject(worldName);

		return true;
	}

	async status() {
		//const {id} = this.validate({id:"int"});

		//let project = await this.model.projects.findOne({where:{id}});
		//if (!project) return this.success(0);
		//project = project.get({plain:true});

		return this.success(2);
	}

	async setProjectUser(list) {
		const userIds = [];

		_.each(list, (o, i) => {
			o = o.get ? o.get({plain:true}) : o;
			userIds.push(o.userId);
			list[i] = o;
		});

		const users = await this.model.users.getUsers(userIds);

		_.each(list, o => {
			o.user = users[o.userId];
		});
	}

	async search() {
		const model = this.model[this.modelName];
		const query = this.validate();

		this.formatQuery(query);

		const result = await model.findAndCount({...this.queryOptions, where:query});
		const rows = result.rows;

		await this.setProjectUser(rows);

		return this.success(result);
	}

	async join() {
		const authUserId = this.getUser().userId;
		let {userId, exclude} = this.validate({userId: "int_optional", exclude:"boolean_optional"});
		if (!authUserId && !userId) return this.throw(400, "参数错误");
		userId = userId || authUserId;
		let list = await this.model.projects.getJoinProjects(userId, undefined, exclude);
		const projects = authUserId ? await this.model.members.findAll({where:{userId: authUserId, objectType: ENTITY_TYPE_PROJECT}}) : [];
		list = _.filter(list, o => {
			if (o.visibility == ENTITY_VISIBILITY_PUBLIC || userId == authUserId) return true;
			const index = _.findIndex(projects, t => t.objectId == o.id);
			return index < 0 ? false : true;
		});

		await this.setProjectUser(list);

		return this.success(list);
	}

	async index() {
		const authUserId = this.getUser().userId;
		const params = this.validate();
		if (!params.userId && !authUserId) return this.throw(400, "参数错误");
		params.userId = params.userId || authUserId;
		this.formatQuery(params);
		let list = await this.model.projects.findAll({...this.queryOptions, where:params});
		const projects = authUserId ? await this.model.members.findAll({where:{userId: authUserId, objectType: ENTITY_TYPE_PROJECT}}) : [];
		list = _.filter(list, o => {
			if (o.visibility == ENTITY_VISIBILITY_PUBLIC || authUserId == params.userId) return true;
			const index = _.findIndex(projects, t => t.objectId == o.id);
			return index < 0 ? false : true;
		});

		await this.setProjectUser(list);
		return this.success(list);
	}

	async create() {
		const userId = this.authenticated().userId;
		const params = this.validate({type:"int"});

		params.userId = userId;
		//params.status = params.type == PROJECT_TYPE_PARACRAFT ? 1 : 2; // 1 - 创建中  2 - 创建完成
		delete params.star;
		delete params.stars;
		delete params.visit;
		delete params.hotNo;
		delete params.choicenessNo;
		delete params.rate;
		delete params.rateCount;
		delete params.classifyTags;

		const data = await this.model.projects.create(params);
		if (!data) return this.throw(500, "记录创建失败");
		const project = data.get({plain:true});

		// 将创建者加到自己项目的成员列表中
		await this.model.members.create({userId, memberId: userId, objectType: ENTITY_TYPE_PROJECT, objectId: project.id});

		if (params.type == PROJECT_TYPE_PARACRAFT) {
			const ok = await this.createWorld(project);
			if (!ok) return this.fail(9);
			//const ok = await this.createWorld(project);
			//if (!ok) {
				//await this.model.projects.destroy({where:{id:project.id}});
				//return this.throw(500, "创建世界失败");
			//}
		}

		return this.success(project);
	}

	async destroy() {
		const {userId} = this.authenticated();
		const {id} = this.validate({id:"int"});

		const project = await this.model.projects.getById(id, userId);
		if (!project) return this.success("OK");

		if (project.type == PROJECT_TYPE_PARACRAFT) {
			const ok = await this.destroyWorld(project);
			//if (!ok) return this.throw(500, "删除世界失败");
		}

		const data = await this.model.projects.destroy({where:{id, userId}});

		return this.success(data);
	}

	async update() {
		const userId = this.authenticated().userId;
		const params = this.validate({"id":"int"});
		const id = params.id;

		delete params.userId;
		delete params.star;
		delete params.stars;
		delete params.visit;
		delete params.hotNo;
		delete params.choicenessNo;
		delete params.rate;
		delete params.rateCount;
		delete params.classifyTags;

		const data = await this.model.projects.update(params, {where:{id, userId}});

		return this.success(data);
	}

	async visit() {
		const {id} = this.validate({id:'int'});

		const project = await this.model.projects.getById(id);
		
		if (!project) return this.throw(404);

		//project.visit++;
		await this.model.projects.statistics(id, 1, 0, 0);

		//await this.model.projects.update({visit:project.visit}, {where:{id}});

		return this.success(project);
	}

	async isStar() {
		const {userId} = this.authenticated();
		const {id} = this.validate({id:'int'});

		const project = await this.model.projects.getById(id);
		if (!project) return this.throw(404);

		const index = _.findIndex(project.stars, id => id == userId);

		return this.success(index < 0 ? false : true);
	}

	async star() {
		const {userId} = this.authenticated();
		const {id} = this.validate({id:'int'});

		const project = await this.model.projects.getById(id);
		if (!project) return this.throw(404);

		project.stars = project.stars || [];
		const index = _.findIndex(project.stars, id => id == userId);
		if (index >= 0) return this.success(project);

		project.stars.push(userId);
		//project.star++;
		await this.model.projects.update(project, {fields:["stars"], where:{id}});

		await this.model.projects.statistics(id, 0, 1, 0);

		return this.success(project);
	}

	async unstar() {
		const {userId} = this.authenticated();
		const {id} = this.validate({id:'int'});

		const project = await this.model.projects.getById(id);
		if (!project) return this.throw(404);

		project.stars = project.stars || [];
		const index = _.findIndex(project.stars, id => id == userId);
		if (index < 0) return this.success(project);
		project.stars.splice(index, 1);
		await this.model.projects.update(project, {fields:["stars"], where:{id}});

		//project.star--;
		await this.model.projects.statistics(id, 0, -1, 0);

		return this.success(project);
	}

	async detail() {
		const {id} = this.validate({id:'int'});

		const project = await this.model.projects.getById(id);
		if (!project) return this.throw(404);
		
		project.favoriteCount = await this.model.favorites.objectCount(project.id, ENTITY_TYPE_PROJECT);
		if (project.type == PROJECT_TYPE_PARACRAFT) {
			project.world = await this.model.worlds.getByProjectId(project.id);
		}

		return this.success(project);
	}

	async world() {
		//const {id} = this.validate()
	}

	async importProject() {
		for (let i = 0; i < worlds.length; i++) {
			const world = worlds[i];
			const {userid, worldsName, _id} = world;
			let project = null;
			try {
				project = await this.model.projects.create({
					userId:userid, 
					name: worldsName, 
					type: PROJECT_TYPE_PARACRAFT,
					privilege: 165,
				});
				project = project.get({plain:true});
			} catch(e) {
				console.log(e);
				continue;
			}
			
			try {
				await this.model.worlds.create({
					//id: _id,
					userId: userid,
					worldName: worldsName,
					projectId: project.id,
					fileSize: world.filesTotals,
					giturl: world.giturl,
					commitId: world.commitId,
					download: world.download,
					revision: world.revision,
					archiveUrl: world.giturl ? (world.giturl + '/repository/archive.zip?ref=' + world.commitId) : "",
				});
			} catch(e) {
				console.log(e);
			}
		}
		//console.log(worlds.length);
		return this.success(worlds);
	}

	async importProjectCover() {
		//const worlds = await this.model.worlds.findAll({limit:100000});
		for (let i = 0; i < worlds.length; i++) {
			//const world = worlds[i].get({plain:true});
			const world = worlds[i];
			const {userid, worldsName, _id, commitId="master"} = world;

			if (!world.preview) continue;
			let previewUrl = world.preview;
			try {
				previewUrl = JSON.parse(world.preview)[0].previewUrl;
			} catch(e) {
				previewUrl = world.preview;
			}

			let project = await this.model.projects.findOne({where:{userId:userid, name: worldsName}});
			if (!project) continue;
			project = project.get({plain:true});
			const extra = project.extra;

			previewUrl = previewUrl.replace(/http:/, "https:");
		   	const archiveUrl = previewUrl.replace(/\/raw\/.*$/, "") + '/repository/archive.zip?ref=' + commitId; 
			await this.model.worlds.update({extra:{coverUrl: previewUrl}, archiveUrl}, {where:{userId:userid, worldName: worldsName}});
			extra.imageUrl = previewUrl;
			await this.model.projects.update({extra}, {where: {id: project.id}});
		}

		console.log(worlds.length);

		return this.success("OK");
	}

	// 获取项目参加的赛事
	async game() {
		const {id} = this.validate({id:"int"});
		const curdate = new Date();
		const Op = this.app.Sequelize.Op;
		const game = await this.model.games.findOne({
			include: [
			{
				as: "gameWorks",
				model: this.model.gameWorks,
				where: {
					projectId:id,
				},
			},
			],
			where: {
				startDate: {[Op.lte]: curdate},
				endDate: {[Op.gte]: curdate},
			},
		}).then(o => o && o.toJSON());

		return this.success(game);
	}
}

module.exports = Project;
