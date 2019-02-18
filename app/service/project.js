
const crypto = require("crypto");
const pingpp = require("pingpp");
const moment = require("moment");
const _ = require('lodash');
//const Service = require('egg').Service;
const Service = require("../core/service.js");

class Project extends Service {
	// 项目评分
	async rate(projectId, rate) {
		if (!projectId) return;
		const project = await this.app.model.projects.getById(projectId);
		if (!project) return;
		const type = this.app.model.QueryTypes.SELECT;
		const projectsAvgRate = 70;
		const arr = await this.app.model.query(`select avg(rate) as avgrate, count(*) as count from projectRates where projectId = :projectId`, {type,replacements: {projectId}});
		if (arr.length != 1) return;
		const projectAvgRate = _.toNumber(arr[0]["avgrate"]);
		const projectRateCount = _.toNumber(arr[0]["count"]);
		const rateThreshold = 20;
		const projectRate = projectRateCount < 8 ? 0 : (projectRateCount / (projectRateCount + rateThreshold) * projectAvgRate + rateThreshold / (projectRateCount + rateThreshold) *projectsAvgRate);
	
		const extra = project.extra || {};
		extra.rate = extra.rate || {};
		const rateLevel = _.floor(rate / 20);
		extra.rate[rateLevel] = (extra.rate[rateLevel] || 0) + 1;
		extra.rate.count = projectRateCount;

		await this.app.model.projects.update({rate:projectRate, rateCount:projectRateCount, extra}, {where:{id: projectId}});

		project.rate = projectRate;
		project.extra = extra;

		this.app.api.projectsUpsert(project);
		return;
	}

	// 作品评分
	async worksRate(projectId, rate) {
		const curdate = new Date();
		const Op = this.app.Sequelize.Op;
		const game = await this.model.games.findOne({
			include: [
			{
				as: "gameWorks",
				model: this.model.gameWorks,
				where: {
					projectId,
				},
			},
			],
			where: {
				startDate: {[Op.lte]: curdate},
				endDate: {[Op.gte]: curdate},
			},
		}).then(o => o && o.toJSON());
		if (!game) return;
		const worksId = game.gameWorks.id;
		const startDate = game.startDate;
		const endDate = game.endDate;
		const type = this.app.model.QueryTypes.SELECT;
		const projectsAvgRate = 70;
		const arr = await this.app.model.query(`select avg(rate) as avgrate, count(*) as count from projectRates where projectId = :projectId and createdAt >= :startDate and createdAt <= :endDate`, {type,replacements: {projectId, startDate, endDate}});
		if (arr.length != 1) return;
		const projectAvgRate = _.toNumber(arr[0]["avgrate"]);
		const projectRateCount = _.toNumber(arr[0]["count"]);
		const rateThreshold = 20;
		const projectRate = projectRateCount < 8 ? 0 : (projectRateCount / (projectRateCount + rateThreshold) * projectAvgRate + rateThreshold / (projectRateCount + rateThreshold) * projectsAvgRate);
		await this.app.model.gameWorks.update({worksRate: projectRate, worksRateCount: projectRateCount}, {where:{id: worksId}});
		return;
	}
}

module.exports = Project;