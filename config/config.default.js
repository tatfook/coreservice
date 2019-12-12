'use strict';
exports.keys = 'keepwork';

const { ValidationError } = require('ajv');
exports.cors = {
    origin: '*',
};

exports.middleware = [ 'authenticated', 'pagination', 'graphql', 'organization' ];

exports.security = {
    xframe: {
        enable: false,
    },
    csrf: {
        enable: false,
    },
};

exports.onerror = {
    all: (e, ctx) => {
        // const message = ctx.app.config.self.env == "prod" ? e.toString() : e.stack || e.message || e.toString();
        const message =
            ctx.app.config.self.env === 'prod'
                ? '请求不合法'
                : e.stack || e.message || e.toString();

        ctx.status = e.status || 500;
        ctx.body = message;

        if (e.name === 'SequelizeUniqueConstraintError') {
            ctx.status = 409;
        }

        if (e instanceof ValidationError) {
            ctx.body = JSON.stringify(e.errors);
            ctx.status = 422;
        }
    },
};

exports.ajv = {
    keyword: 'validator2', // to indicate the namespace and path of schemas, default as 'validator2'
    options: {
        allErrors: true, // required for custom error message
        jsonPointers: true, // required for custom error message
    },
};
