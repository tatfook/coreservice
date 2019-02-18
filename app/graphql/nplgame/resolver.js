
'use strict';

module.exports = {
	GameWorks: {
		project(root, {}, ctx) {
			return ctx.service.loader.fetchProjectById(root.id);
		},

		user(root, {}, ctx) {
			return ctx.service.loader.fetchUserById(root.id);
		}
	},

	Game: {
		works(root, {}, ctx) {
			return ctx.service.nplgame.getGameWorks({gameId: root.id});
		},
		members(root, {}, ctx) {
			return ctx.service.nplgame.getGameMembers({gameId: root.id});
		},
	}
};
