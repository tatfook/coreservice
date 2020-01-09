'use strict';

module.exports = {
    type: 'object',
    properties: {
        userIds: {
            type: 'array',
            items: {
                type: 'number',
                minimum: 1,
            },
            minItems: 1,
        },
        apiKey: {
            type: 'string',
        },
    },
};
