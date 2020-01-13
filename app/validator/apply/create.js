'use strict';

module.exports = {
    $merge: {
        source: { $ref: 'validator.apply.common' },
        with: {
            properties: {
                applyId: {
                    type: 'integer',
                },
                legend: {
                    type: 'string',
                    maxLength: 255,
                },
            },
            required: ['objectId', 'objectType', 'applyId', 'applyType'],
            additionalProperties: false,
        },
    },
};
