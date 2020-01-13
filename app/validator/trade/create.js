'use strict';
const {
    TRADE_TYPE_DEFAULT,
    TRADE_TYPE_HAQI_EXCHANGE,
    TRADE_TYPE_PACKAGE_BUY,
} = require('../../core/consts');
module.exports = {
    type: 'object',
    title: 'empty object',
    properties: {
        type: {
            type: 'integer',
            description: '交易类型',
            enum: [
                TRADE_TYPE_DEFAULT,
                TRADE_TYPE_HAQI_EXCHANGE,
                TRADE_TYPE_PACKAGE_BUY,
            ],
            enumDesc: '0 默认\n1 哈奇兑换\n2 课程包购买',
        },
        goodsId: {
            type: 'integer',
            description: '物品ID',
        },
        count: {
            type: 'integer',
            description: '购买量',
        },
        discountId: {
            type: 'integer',
            description: '优惠券ID',
        },
    },
    required: ['type', 'goodsId', 'count'],
    additionalProperties: false,
};
