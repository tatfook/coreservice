/* eslint-disable no-empty-pattern */

'use strict';

module.exports = {
    Project: {
        world(root, {}, ctx) {
            return ctx.connector.project.fetchWorldByProjectId(root.id);
        },
    },
};
