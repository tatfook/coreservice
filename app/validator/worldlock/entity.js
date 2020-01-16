'use strict';

module.exports = {
    type: 'object',
    title: 'worldlock entity',
    properties: {
        pid: {
            type: 'integer',
        },
        mode: {
            type: 'string',
            enum: [ 'share', 'exclusive' ],
        },
        revision: {
            type: 'integer',
        },
        server: {
            type: 'string',
            description: 'share mode才有server',
            mock: {
                mock: '@url',
            },
        },
        password: {
            type: 'string',
            mock: {
                mock: '@word',
            },
        },
        owner: {
            type: 'object',
            properties: {
                userId: {
                    type: 'integer',
                },
                username: {
                    type: 'string',
                    mock: {
                        mock: '@word',
                    },
                },
            },
            required: [ 'userId', 'username' ],
        },
        lastLockTime: {
            type: 'string',
            mock: {
                mock: '@datetime',
            },
        },
        maxLockTime: {
            type: 'string',
            mock: {
                mock: '@datetime',
            },
        },
    },
    required: [
        'pid',
        'mode',
        'owner',
        'lastLockTime',
        'maxLockTime',
        'revision',
    ],
    description: 'lock 信息',
};
