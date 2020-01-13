'use strict';
const {
    ENTITY_TYPE_SITE,
    ENTITY_TYPE_GROUP,
    ENTITY_TYPE_PROJECT, // 项目
} = require('../../core/consts.js');
module.exports = {
    type: 'object',
    title: 'commom object',
    properties: {
        objectId: {
            type: 'integer',
        },
        objectType: {
            type: 'integer',
            enum: [ENTITY_TYPE_SITE, ENTITY_TYPE_GROUP, ENTITY_TYPE_PROJECT],
        },
    },
    required: ['objectId', 'objectType'],
};
