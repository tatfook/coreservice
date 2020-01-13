'use strict';

module.exports = {
    $merge: {
        source: { $ref: 'validator.apply.common' },
        with: {
            properties: {
                applyId: {
                    type: 'integer',
                },
            },
            required: [ 'objectId', 'objectType', 'applyId', 'applyType' ],
        },
    },
};
