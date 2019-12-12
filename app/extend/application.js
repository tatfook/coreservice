'use strict';

const Ajv = require('ajv');
const APPAJV = Symbol.for('app#ajv');

module.exports = {
    get ajv() {
        if (!this[APPAJV]) {
            const config = this.config.ajv || {};
            const ajv = new Ajv(
                Object.assign(
                    {
                        allErrors: true, // required for custom error message
                        jsonPointers: true, // required for custom error message
                    },
                    config.options || {
                        removeAdditional: true, // https://github.com/epoberezkin/ajv#filtering-data
                        useDefaults: true, // https://github.com/epoberezkin/ajv#assigning-defaults
                        coerceTypes: true, // https://github.com/epoberezkin/ajv#coercing-data-types
                    }
                )
            );
            require('ajv-merge-patch')(ajv);
            require('ajv-errors')(ajv, {
                keepErrors: config.keepErrors || true,
                singleError: config.singleError || true,
            });
            this[APPAJV] = ajv;
        }

        return this[APPAJV];
    },
};
