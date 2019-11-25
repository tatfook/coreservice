'use strict';
module.exports = () => {
    // const config = app.config.self;

    return async function(ctx, next) {
        await next();
    };
};
