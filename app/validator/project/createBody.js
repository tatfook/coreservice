'use strict';

module.exports = {
    type: 'object',
    properties: {
        description: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        privilege: {
            type: 'number',
        },
        type: {
            type: 'number',
            enum: [0, 1],
            enumDesc: '0网站；1世界',
        },
        visibility: {
            type: 'number',
        },
        siteId: {
            type: 'integer',
        },
        tags: {
            type: 'string',
        },
    },
    required: ['type', 'name'],
};
