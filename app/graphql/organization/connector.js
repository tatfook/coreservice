
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
			const list = await ctx.app.lessonModel.packages.findAll({where:{id:{$in: ids}}}).then(list => list.map(o => o.toJSON()));
			return _.map(ids, id => _.find(list, o => o.id == id));
		});
		this.lessonLoader = new DataLoader(async ids => {
			const list = await ctx.app.lessonModel.lessons.findAll({where:{id:{$in: ids}}}).then(list => list.map(o => o.toJSON()));
			return _.map(ids, id => _.find(list, o => o.id == id));
		});
		this.classroomLoader = new DataLoader(async ids => {
			const list = await ctx.app.lessonModel.classrooms.findAll({where:{id:{$in: ids}}}).then(list => list.map(o => o.toJSON()));
			return _.map(ids, id => _.find(list, o => o.id == id));
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
		const pkgs = await this.app.model.lessonOrganizationPackages.findAll({
			where:{organizationId, classId},
		}).then(list => list.map(o => {
			o = o.toJSON();
			o.lessonNos = o.lessons;
			return o;
		}));

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
		const sql = `select count(*) as count from (select * from lessonOrganizationClassMembers where organizationId = ${organizationId} and classId ${classId == undefined ? "> 0" : ("=" + classId)} and roleId & ${roleId} group by memberId) as alias`;
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
		let sql = `select id, organizationId, classId, memberId, realname, roleId from lessonOrganizationClassMembers where organizationId=:organizationId and roleId & :roleId group by memberId`;
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

	async fetchOrganizationClasses({organizationId, memberId, roleId}) {
		const include = [];
		if (memberId != undefined) {
			include.push({
				as: "lessonOrganizationClassMembers",
				model: this.ctx.model.lessonOrganizationClassMembers,
				where: {memberId},
			});
		}
		const list = await this.ctx.model.lessonOrganizationClasses.findAll({
			include,
			where: organizationId == undefined ? {} : {organizationId},
		}).then(list => list.map(o => o.toJSON()));

		// 返回用户的roleId
		list.map(o => {
			if (o.lessonOrganizationClassMembers && o.lessonOrganizationClassMembers.length) {
				o.roleId = o.lessonOrganizationClassMembers[0].roleId;
			}
		});

		return list.filter(o => o.roleId);
	}

	async fetchPackage({id}) {
		return await this.packageLoader.load(id);
	}

	async fetchUserPackages(userId) {
		const pkgs = await this.model.lessonOrganizationPackages.findAll({
			include: [
			{
				as: "lessonOrganizationClassMembers",
				model: this.model.lessonOrganizationClassMembers,
				where: {
					memberId:userId,
				},
				required: true,
			},
			]
		}).then(list => list.map(o => o.toJSON()));
		return pkgs;
	}

	async fetchPackageLearned({packageId, userId}) {
		return await this.ctx.lessonModel.learnRecords.findAll({
			attributes: ["lessonId"],
			where: {
				userId,
				packageId,
				state: 1,
			}
		}).then(list => list.map(o => o.lessonId));
	}

	async fetchClassrooms({userId, packageId, classId}) {
		const where = {userId, packageId};
		if (classId != undefined) where.classId = classId;
		return await this.ctx.lessonModel.classrooms.findAll({where}).then(list => list.map(o => o.toJSON()));
	}

	async fetchCurrentClassroom({userId}) {
		const user = await this.ctx.lessonModel.users.findOne({where:{id: userId}}).then(o => o && o.toJSON());
		if (!user) return null;
		const classroomId = user.extra.classroomId;
		return await this.ctx.lessonModel.classrooms.findOne({where:{id: classroomId}}).then(o => o && o.toJSON());
	}

	async fetchOrganizationsByLessonId(lessonId){
		const pls = await this.lessonModel.packageLessons.findAll({where:{lessonId}}).then(list => list.map(o => o.toJSON()));
		const pkgIds = _.map(pls, o => o.packageId);
		const organs =await this.model.lessonOrganizations.findAll({
			include: [
			{
				as: "lessonOrganizationPackages",
				model: this.model.lessonOrganizationPackages,
				where: {
					packageId: {$in: pkgIds},
					classId:0,
				},
			},
			]
		}).then(list => list.map(o => o.toJSON()));

		return _.filter(organs, o => _.find(o.lessonOrganizationPackages, x => _.find(x.lessons, l => l.lessonId == lessonId)));
	}
}

module.exports = OrganizationConnector;

