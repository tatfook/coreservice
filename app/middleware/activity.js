'use strict';

module.exports = (options, app) => {
    // del
    const activity = async ctx => {
        const userId = (ctx.state.user || {}).userId || 0;
        const path = ctx.path;
        const prefix = app.config.self.apiUrlPrefix;
        let action = '';
        const description = '';
        const extra = { path, params: ctx.getParams() };

        // console.log(extra);
        if (path === `${prefix}users/login`) {
            action = 'login';
            await app.model.activities.create({
                userId,
                action,
                description,
                extra,
            });
        } else if (path === `${prefix}ussers/register`) {
            action = 'register';
            await app.model.activities.create({
                userId,
                action,
                description,
                extra,
            });
        } else {
            action = 'unknow';
            if (ctx.app.config.self.env !== 'prod') {
                await app.model.activities.create({
                    userId,
                    action,
                    description,
                    extra,
                });
            }
        }
    };

    return async function(ctx, next) {
        activity(ctx);

        await next();
    };
};
