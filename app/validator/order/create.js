'use strict';

module.exports = {
    type: 'object',
    properties: {
        amount: {
            type: 'integer',
            description: '金额',
        },
        channel: {
            type: 'string',
            description: '渠道',
            enum: [ 'wx_pub_qr', 'alipay_qr' ],
        },
    },
    required: [ 'amount', 'channel' ],
};
