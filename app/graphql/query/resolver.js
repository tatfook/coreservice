
'use strict';

const _ = require("lodash");

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

		user(root, {id, name }, ctx) {
			console.log(id,name);
			return {id, username: name};
			//return ctx.connector.user.fetchById(id);
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

		games(root, {query = {}}, ctx) {
			return ctx.model.games.findAndCount({
				where: query
			});
		},

		async organization(root, {id, name}, ctx) {
			if (!id && !name) return ctx.throw(400);
			if (id) {
				return await ctx.connector.organization.fetchById(id);
			} else {
				return await ctx.connector.organization.fetchByName(name);
			}
		},

		async organizationClass(root, {id}, ctx) {
			return await ctx.model.lessonOrganizationClasses.findOne({where:{id}}).then(o => o && o.toJSON());
		},

		async organizationPackage(root, {id}, ctx) {
			return await ctx.model.lessonOrganizationPackages.findOne({where:{id}}).then(o => o && o.toJSON());
		},

		async package(root, {id}, ctx) {
			return await ctx.connector.organization.fetchPackage({id});
		},

		organizationUser(root, {}, ctx) {
			const {userId, organizationId} = ctx.authenticated();
			return {userId, organizationId};
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
