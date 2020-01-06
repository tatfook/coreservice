/* eslint-disable no-magic-numbers */
'use strict';

module.exports = {
    type: 'object',
    title: 'empty object',
    properties: {
        url: {
            type: 'string',
        },
        type: {
            type: 'integer',
            default: '0',
            enum: [ 0, 1, 2, 3, 4, 5 ],
            enumDesc:
                '类型 0 -- 其它  1 -- 假冒网站 2 -- 传播病毒 3 -- 反动  4 -- 色情 5 -- 暴力',
        },
        description: {
            type: 'string',
        },
    },
    required: [ 'url' ],
    additionalProperties: false,
};
