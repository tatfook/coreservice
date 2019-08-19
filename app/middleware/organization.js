
const _ = require("lodash");

module.exports = (options, app) => {
	const config = app.config.self;
	const apiPathPrefix = config.apiUrlPrefix;

	return async function(ctx, next) {
		const path = ctx.path;
		if (path.indexOf(`${apiPathPrefix}organizations`) == 0) {
			const {userId, organizationId, roleId} = ctx.state.user;
			const params =  _.merge({}, ctx.request.body, ctx.query, ctx.params);

			if (userId && params.organizationId && params.organizationId != organizationId) {
				organizationId = params.organizationId;
				roleId = await ctx.service.organization.getRoleId(organizationId, userId);

				ctx.state.organizationId = organizationId;
				ctx.state.roleId = roleId;
			}

		}

		await next();
	}
}

