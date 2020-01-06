'use strict';
const {
    APPLY_STATE_REFUSE,
    APPLY_STATE_AGREE, // 项目
} = require('../../core/consts.js');
module.exports = {
    type: 'object',
    properties: {
        id: {
            type: 'integer',
        },
        state: {
            type: 'integer',
            enum: [ APPLY_STATE_REFUSE, APPLY_STATE_AGREE ],
        },
    },
    required: [ 'state', 'id' ],
    additionalProperties: false,
};
