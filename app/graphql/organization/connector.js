
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

	async fetchOrganizationPackages(organizationId) {
		const pkgs = await this.app.model.lessonOrganizationPackages.findAll({where:{organizationId, classId:0}}).then(list => list.map(o => o.toJSON()));
		const pkgIds = _.map(pkgs, o => o.packageId);
		const pkgsInfo = await this.packageLoader.loadMany(pkgIds);
		for (let i = 0; i < pkgs.length; i++) {
			let pkg = pkgs[i];
			pkg.package = _.find(pkgsInfo, o => o.id == pkg.packageId);
			const lessonIds = _.map(pkg.lessons, o => o.lessonId);
			const lessons = await this.lessonLoader.loadMany(lessonIds);
			//_.each(pkg.lessons, o => {
				//o.lesson = _.find(lessons, l => l.id == o.lessonId);
			//});
			pkg.lessons = lessons;
		}
		return pkgs;
	}
}

module.exports = OrganizationConnector;

