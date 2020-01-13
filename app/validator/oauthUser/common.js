'use strict';

module.exports = {
    properties: {
        clientId: {
            type: 'string',
        },
        code: {
            type: 'string',
        },
        redirectUri: {
            type: 'string',
        },
        state: {
            type: 'string',
        },
    },
    required: ['clientId', 'code', 'redirectUri', 'state'],
};
