'use strict';

module.exports = {
    UserRank: {
        user(root, _, ctx) {
            return ctx.connector.user.fetchById(root.userId);
        },
    },
};
