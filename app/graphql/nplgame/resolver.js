
'use strict';

module.exports = {
	GameWorks: {
		project(root, {}, ctx) {
			return ctx.service.loader.fetchProjectById(root.id);
		},

		user(root, {}, ctx) {
			return ctx.service.loader.fetchUserById(root.id);
		}
	}
};
