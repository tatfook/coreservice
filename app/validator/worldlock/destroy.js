'use strict';

module.exports = {
    type: 'object',
    title: 'upsert worldlock',
    properties: {
        pid: {
            type: 'string',
        },
    },
    required: [ 'pid' ],
};
