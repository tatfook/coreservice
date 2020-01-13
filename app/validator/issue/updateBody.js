'use strict';

module.exports = {
    type: 'object',
    title: 'empty object',
    properties: {
        id: {
            type: 'integer',
        },
        title: {
            type: 'string',
        },
        tags: {
            type: 'string',
        },
        assigns: {
            type: 'string',
        },
        state: {
            type: 'integer',
            enum: [0, 1],
        },
    },
    additionalProperties: false,
    required: ['id'],
};
