'use strict';

module.exports = {
	User: {
		rank(root, {userId}, ctx) {
			return ctx.connector.user.fetchRankByUserId(root.id);
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
		}
	},
};


	//fans(page: Int = 1, perPage: Int = 100): [Favorite]
	//favorites(page: Int = 1, perPage: Int = 100): [Favorite]
//type FansUser {
	//id ID!
//}
