'use strict';

module.exports = {
	UserInfo: {
		async identify(root, _, ctx) {
			const user = await ctx.connector.user.fetchLessonUserByUserId(root.id);
			return user ? user.identify : 0;
		},

		rank(root, {userId}, ctx) {
			return ctx.connector.user.fetchRankByUserId(root.id);
		},

		info(root, {}, ctx) {
			return ctx.connector.user.fetchInfoByUserId(root.id);
		},

		account(root, _, ctx) {
			return ctx.connector.user.fetchAccountByUserId(root.id);
		},

		contributions(root, {years}, ctx) {
			years = (years || "").split(",");
			return ctx.connector.user.fetchContributionsByUserId(root.id, years);
		},

		projects(root, _, ctx) {
			return ctx.connector.project.fetchByUserId(root.id);
		},

		joinProjects(root, _, ctx) {
			return ctx.connector.project.fetchJoinByUserId(root.id);
		},

		tutor(root, _, ctx) {
			return ctx.connector.user.fetchTutorByUserId(root.id);
		},

		teacher(root, _, ctx) {
			return ctx.connector.user.fetchTeacherByUserId(root.id);
		},

		roles(root, _, ctx) {
			return ctx.connector.user.fetchRolesByUserId(root.id);
		}
	},

	Mutation: {
		async updateUser(root, {data={}}, ctx) {
			return true;
		},
	},
};

