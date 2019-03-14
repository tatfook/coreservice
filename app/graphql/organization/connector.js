
'use strict';

const DataLoader = require('dataloader');
const _ = require("lodash");

class OrganizationConnector {
	constructor(ctx) {
		this.ctx = ctx;
		this.app = ctx.app;
		this.model = ctx.app.model;
		this.lessonModel = ctx.app.lessonModel;
		this.loader = new DataLoader(ids => this.fetch(ids));
		this.packageLoader = new DataLoader(async ids => {
			return await ctx.app.lessonModel.packages.findAll({where:{id:{$in: ids}}}).then(list => list.map(o => o.toJSON()));
		});
		this.lessonLoader = new DataLoader(async ids => {
			return await ctx.app.lessonModel.lessons.findAll({where:{id:{$in: ids}}}).then(list => list.map(o => o.toJSON()));
		});
	}

	async fetch(ids) {
		return await this.ctx.app.model.lessonOrganizations.findAll({where: {id: {$in: ids}}}).then(list => list.map(o => o.toJSON()));
	}

	async fetchByIds(ids) {
		return await this.loader.loadMany(ids);
	}

	async fetchById(id) {
		return await this.loader.load(id);
	}

	async fetchByName(name) {
		return this.model.lessonOrganizations.findOne({where:{name}}).then(o => o && o.toJSON());
	}

	async fetchOrganizationPackages({organizationId, classId = 0}) {
		const pkgs = await this.app.model.lessonOrganizationPackages.findAll({where:{organizationId, classId}}).then(list => list.map(o => o.toJSON()));
		//const pkgIds = _.map(pkgs, o => o.packageId);
		//const pkgsInfo = await this.packageLoader.loadMany(pkgIds);
		//for (let i = 0; i < pkgs.length; i++) {
			//let pkg = pkgs[i];
			//pkg.package = _.find(pkgsInfo, o => o.id == pkg.packageId);
			//const lessonIds = _.map(pkg.lessons, o => o.lessonId);
			//const lessons = await this.lessonLoader.loadMany(lessonIds);
			////_.each(pkg.lessons, o => {
				////o.lesson = _.find(lessons, l => l.id == o.lessonId);
			////});
			//pkg.lessons = lessons;
		//}
		return pkgs;
	}

	async fetchOrganizationUserCount({organizationId, classId, roleId}) {
		let sql = `select count(*) as count from lessonOrganizationClassMembers where organizationId=:organizationId and roleId & :roleId`;
		if (classId != undefined) sql += ` and classId = ${classId}`;
		const list = await this.ctx.model.query(sql, {
			type: this.ctx.model.QueryTypes.SELECT,
			replacements: {
				organizationId,
				roleId,
				classId,
			}
		});
		return list[0].count;
		
	}
	
	async fetchOrganizationMembers({organizationId, classId, roleId}) {
		let sql = `select id, organizationId, classId, memberId, realname, roleId from lessonOrganizationClassMembers where organizationId=:organizationId and roleId & :roleId`;
		if (classId != undefined) sql += ` and classId = ${classId}`;
		const list = await this.ctx.model.query(sql, {
			type: this.ctx.model.QueryTypes.SELECT,
			replacements: {
				organizationId,
				roleId,
				classId,
			}
		});

		const userIds = _.map(list, o => o.memberId);
		const users = await this.ctx.model.users.findAll({
			attributes: ["id", "username", "nickname", "portrait"],
			where:{id:{$in:userIds}}
		}).then(list => list.map(o => o.toJSON()));
		_.each(list, o => o.user = _.find(users, u => u.id == o.memberId));

		return list;
	}

	async fetchOrganizationClasses({organizationId}) {
		return await this.ctx.model.lessonOrganizationClasses.findAll({
			where:{
				organizationId,
				//classId:{$ne: 0},
			},
		}).then(list => list.map(o => o.toJSON()));
	}

	async fetchPackage({id}) {
		return await this.packageLoader.load(id);
	}
}

module.exports = OrganizationConnector;

