
'use strict';

module.exports = {
	Query: {
		test(root, arg, ctx) {
			console.log(arg);
			return arg || {key:1};
		},

		profile(root, {}, ctx) {
			const userId = (ctx.state.user || {}).userId || 0;
			if (userId < 1) return ctx.throw(411);
			return ctx.connector.user.fetchById(userId);
		},

		user(root, { id }, ctx) {
			return ctx.connector.user.fetchById(id);
		},

		projects(root, {userId}, ctx) {
			return ctx.connector.project.fetchByUserId(userId);
		},

		joinProjects(root, {userId}, ctx) {
			return ctx.connector.project.fetchJoinByUserId(userId);
		},

		ranks(root, {type}, ctx) {
			return ctx.connector.userRank.fetchAll();
		},

		nplGameMembers(root, {query}, ctx) {
		},
	},

	Mutation: {
		async sendSmsCaptcha(root, {cellphone}, ctx) {
			return await ctx.service.sms.sendSmsCaptcha(cellphone);
		},

		async verifySmsCaptcha(root, {cellphone, captcha}, ctx) {
			return await ctx.service.sms.verifyCaptcha(cellphone, captcha);
		},
	},
};
