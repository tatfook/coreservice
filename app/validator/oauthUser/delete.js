'use strict';

module.exports = {
    properties: {
        password: {
            type: 'string',
        },
        id: {
            type: 'integer',
        },
    },
    required: ['password', 'id'],
};
