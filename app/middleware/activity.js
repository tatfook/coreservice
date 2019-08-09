
const axios = require("axios");

module.exports = (options, app) => {

	const activity = async (ctx) => {
		const userId = (ctx.state.user || {}).userId || 0;
		const path = ctx.path;
		const prefix = app.config.self.apiUrlPrefix;
		let action = "", description = "", extra = {};
		
		if (path == `${prefix}users/login`) {
			action = "login";
			await app.model.activities.create({userId, action, description, extra});
		} else if(path == `${prefix}ussers/register`) {
			action = "register";
			await app.model.activities.create({userId, action, description, extra});
		} else {
			action = "unknow";
		}
		
	} 

	return async function(ctx, next) {
		await next();

		activity(ctx);
	}
}
