'use strict';

const DataLoader = require('dataloader');

class UserConnector {
	constructor(ctx) {
		this.ctx = ctx;
		this.model = ctx.app.model;
		this.loader = new DataLoader(this.fetch.bind(this));
	}

	fetch(ids) {
		const users = this.ctx.app.model.User.findAll({
		where: {
			id: {
				$in: ids,
			},
		},
		}).then(us => us.map(u => u.toJSON()));
		return users;
	}

	fetchByIds(ids) {
		return this.loader.loadMany(ids);
	}

	// 获取指定用户
	fetchById(id) {
		return this.loader.load(id);
	}

	// 获取用户排名信息
	async fetchRankByUserId(userId) {
		return await this.model.userRanks.findOne({where: {userId}}).then(ts => ts && ts.toJSON());
	}

	// 获取用户账户信息
	async fetchAccountByUserId(userId) {
		return await this.model.accounts.getByUserId(userId);
	}

	// 获取用户活跃度信息
	async fetchContributionsByUserId(userId, years) {
		return {data:await this.model.contributions.getByUserId(userId, years)};
	}

	// 获取用户粉丝信息
	async fetchFansByUserId(userId, page, perPage) {
		return this.model.favorites.getFollows(userId);
	}
}

module.exports = UserConnector;

