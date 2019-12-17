'use strict';

module.exports = {
    $merge: {
        source: { $ref: 'validator.member.common' },
        with: {
            properties: {
                memberIds: {
                    type: 'array',
                    items: {
                        type: 'integer',
                    },
                },
            },
        },
    },
};
