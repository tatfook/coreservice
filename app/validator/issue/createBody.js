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
    properties: {
        objectType: {
            type: 'integer',
            enum: [
                ENTITY_TYPE_USER,
                ENTITY_TYPE_SITE,
                ENTITY_TYPE_PAGE,
                ENTITY_TYPE_GROUP,
                ENTITY_TYPE_PROJECT,
            ],
        },
        objectId: {
            type: 'integer',
        },
        title: {
            type: 'string',
        },
        content: {
            type: 'string',
        },
        tags: {
            type: 'string',
            description: '标签数组，用“|”符号分割',
        },
        assigns: {
            type: 'string',
            description: '指派给谁，id数组，用“|”符号分割',
        },
    },
    required: [ 'objectType', 'objectId', 'title', 'content' ],
};
