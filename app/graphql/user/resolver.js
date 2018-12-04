'use strict';

module.exports = {
	User: {
		rank(root, {userId}, ctx) {
			return ctx.connector.user.fetchRankByUserId(root.id);
		},
		contributions(root, {years}, ctx) {
			years = (years || "").split(",");
			return ctx.connector.user.fetchContributionsByUserId(root.id, years);
		},
	},
};
