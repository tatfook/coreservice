'use strict';

module.exports = {
    properties: {
        client_id: {
            type: 'string',
        },
        state: {
            type: 'string',
        },
    },
    required: [ 'client_id' ],
};
