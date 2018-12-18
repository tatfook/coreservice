
'use strict';

module.exports = {
	Query: {
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
			console.log(type);
			return ctx.connector.userRank.fetchAll();
		}
	}
};
