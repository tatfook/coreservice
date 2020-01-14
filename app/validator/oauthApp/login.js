'use strict';

module.exports = {
    type: 'object',
    title: 'empty object',
    properties: {
        username: {
            type: 'string',
        },
        password: {
            type: 'string',
        },
    },
    required: [ 'username', 'password' ],
};
