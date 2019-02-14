'use strict';

const DataLoader = require('dataloader');

class UserConnector {
	constructor(ctx) {
		this.ctx = ctx;
		this.model = ctx.app.model;
		this.lessonModel = ctx.app.lessonModel;
		this.loader = new DataLoader(ids => this.fetch(ids));
	}

	async fetch(ids) {
		const users = await this.ctx.app.model.User.findAll({where: {id: {$in: ids}}}).then(us => us.map(u => u.toJSON()));
		return users;
	}

	async fetchByIds(ids) {
		return await this.loader.loadMany(ids);
	}

	// 获取指定用户
	async fetchById(id) {
		return await this.loader.load(id);
	}

	// 获取用户排名信息
	async fetchRankByUserId(userId) {
		return await this.model.userRanks.findOne({where: {userId}}).then(ts => ts && ts.toJSON());
	}

	// 获取用户账户信息
	async fetchAccountByUserId(userId) {
		return await this.model.accounts.getByUserId(userId);
	}

	// 获取用户信息
	async fetchInfoByUserId(userId) {
		return await this.model.userinfos.findOne({where:{userId}}).then(o => o && o.toJSON());
	}

	// 获取用户活跃度信息
	async fetchContributionsByUserId(userId, years) {
		return {data:await this.model.contributions.getByUserId(userId, years)};
	}

	// 获取用户粉丝信息
	async fetchFansByUserId(userId, page, perPage) {
		return this.model.favorites.getFollows(userId);
	}

	// 取lesson 用户信息
	async fetchLessonUserByUserId(userId) {
		return await this.lessonModel.users.findOne({where:{id:userId}}) 
	}

	// 取导师信息
	async fetchTutorByUserId(userId) {
		return await this.lessonModel.tutors.getByUserId(userId);
	}

	// 取教师信息
	async fetchTeacherByUserId(userId) {
		return await this.lessonModel.teachers.getByUserId(userId);
	}

	// 获取用户角色
	async fetchRolesByUserId(userId) {
		return await this.model.roles.getByUserId(userId);
	}
}

module.exports = UserConnector;

