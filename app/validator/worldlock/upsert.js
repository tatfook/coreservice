'use strict';

module.exports = {
    type: 'object',
    title: 'empty object',
    properties: {
        pid: {
            type: 'string',
            description: 'project id',
        },
        mode: {
            type: 'string',
            description: '编辑模式',
            enum: [ 'share', 'exclusive' ],
        },
        server: {
            type: 'string',
            description: 'server地址',
        },
        password: {
            type: 'string',
            description: '服务器密码',
        },
        revision: {
            type: 'string',
            description: '开启服务时的revision number',
        },
    },
    required: [ 'pid', 'mode', 'revision' ],
};
