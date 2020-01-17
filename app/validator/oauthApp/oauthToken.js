'use strict';

module.exports = {
    type: 'object',
    title: 'empty object',
    properties: {
        client_id: {
            type: 'string',
        },
        client_secret: {
            type: 'string',
        },
        code: {
            type: 'string',
            description: '认证码',
        },
    },
    required: [ 'client_id', 'client_secret', 'code' ],
};
