'use strict';

module.exports = {
    $merge: {
        source: { $ref: 'validator.member.common' },
        with: {
            properties: {
                memberId: {
                    type: 'integer',
                },
            },
        },
    },
};
