'use strict';
const {
    ENTITY_TYPE_USER,
    ENTITY_TYPE_SITE,
    ENTITY_TYPE_PAGE,
    ENTITY_TYPE_GROUP,
    ENTITY_TYPE_PROJECT, // 项目
} = require('../../core/consts.js');
module.exports = {
    type: 'object',
    title: 'empty object',
    properties: {
        objectId: {
            type: 'integer',
        },
        objectType: {
            type: 'integer',
            enum: [
                ENTITY_TYPE_USER,
                ENTITY_TYPE_SITE,
                ENTITY_TYPE_PAGE,
                ENTITY_TYPE_GROUP,
                ENTITY_TYPE_PROJECT,
            ],
            enumDesc: '0:用户\n1：网站\n2：页面\n3: 组\n5：项目',
        },
        state: {
            type: 'integer',
            enum: [0, 1],
            enumDesc: '0:开启\n1：关闭',
        },
        title: {
            type: 'string',
        },
    },
    required: ['objectId', 'objectType'],
};
