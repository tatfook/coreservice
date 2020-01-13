'use strict';
const {
    APPLY_TYPE_MEMBER,
    ENTITY_TYPE_PROJECT, // 项目
} = require('../../core/consts.js');
module.exports = {
    type: 'object',
    properties: {
        objectId: {
            type: 'integer',
        },
        objectType: {
            type: 'integer',
            enum: [ENTITY_TYPE_PROJECT],
        },
        applyType: {
            type: 'integer',
            enum: [APPLY_TYPE_MEMBER],
        },
    },
    required: ['objectId', 'objectType', 'applyType'],
    additionalProperties: false,
};
