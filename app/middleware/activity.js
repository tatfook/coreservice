
const axios = require("axios");

module.exports = (options, app) => {

	const activity = async (ctx) => {
		const userId = (ctx.state.user || {}).userId || 0;
		const path = ctx.path;
		const prefix = app.config.self.apiUrlPrefix;
		let action = "", description = "", extra = {};
		
		if (path == `${prefix}users/login`) {
			action = "login";
		} else if(path == `${prefix}ussers/register`) {
			action = "register";
		} else {
			action = "unknow";
		}
		
		await app.model.activities.create({userId, action, description, extra});
	} 

	return async function(ctx, next) {
		await next();

		activity(ctx);
	}
}
