
'use strict';

const _ = require("lodash");

module.exports = {
	Query: {
		test(root, arg, ctx) {
			return {id:1};
		},

		profile(root, {}, ctx) {
			const userId = (ctx.state.user || {}).userId || 0;
			if (userId < 1) return ctx.throw(411);
			return ctx.connector.user.fetchById(userId);
		},

		user(root, {id, name }, ctx) {
			if (!id && !name) return ctx.throw(400);
			if (id) {
				return ctx.connector.user.fetchById(id);
			} else {
				return ctx.connector.user.fetchByName(name);
			}
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

		async organizations(root, {userId}, ctx) {
			return [];
		},

		async organization(root, {id, name}, ctx) {
			if (!id && !name) return ctx.throw(400);
			if (id) {
				return await ctx.connector.organization.fetchById(id);
			} else {
				return await ctx.connector.organization.fetchByName(name);
			}
		},

		async organizationClasses(root, {userId}, ctx) {
			return await ctx.connector.organization.fetchOrganizationClasses({memberId:userId});
		},

		async organizationClass(root, {id}, ctx) {
			return await ctx.model.lessonOrganizationClasses.findOne({where:{id}}).then(o => o && o.toJSON());
		},

		async organizationPackage(root, {id}, ctx) {
			return await ctx.model.lessonOrganizationPackages.findOne({where:{id}}).then(o => o && o.toJSON());
		},

		async organizationUser(root, {organizationId, userId, username}, ctx) {
			if (!userId && !username){
				if (!ctx.state.user.userId && !ctx.state.user.username)	 {
					return ctx.throw(400, "用户不存在");
				}
				userId = ctx.state.user.userId;
				username = ctx.state.user.username;
			} 
			let user = null;

			organizationId = organizationId || ctx.state.user.organizationId;
			if (userId) {
				user = await ctx.connector.user.fetchById(userId);	
			} else {
				user = await ctx.model.users.findOne({
					where: {
						"$or": [
						{username: username},
						{cellphone: username},
						{email: username},
						],
					}
				}).then(o => o && o.toJSON());
				//user = await ctx.connector.user.fetchByName(username);	
			}
			if (!user) return ctx.throw(400);

			return {organizationId, userId: user.id, user: {...user, password: undefined}};
		},

		async package(root, {id}, ctx) {
			return await ctx.connector.organization.packageLoader.load(id);
		},

		async lesson(root, {id, packageId}, ctx) {
			const l = await ctx.connector.organization.lessonLoader.load(id);
			return {...l, packageId};
		},

		async tag(root, {id, packageId}, ctx) {
			return await ctx.connector.keepwork.tagLoader.load(id);
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
