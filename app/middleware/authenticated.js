
const axios = require("axios");
const memoryCache = require('memory-cache');

function getCookieToken(ctx) {
	return ctx.cookies.get("token");
}

function getAuthorizationHeaderToken(ctx) {
	const authorization = ctx.header.authorization || "";
	const parts = authorization.split(' ');

	if (parts.length == 2) {
		if (/^Bearer$/i.test(parts[0])) return parts[1];
	}

	return;
}

module.exports = (options, app) => {
	const config = app.config.self;
	return async function(ctx, next) {
		if (config.debug) {
			ctx.state.user = {userId:137, username:"xiaoyao", roleId:10};
			ctx.state.token = app.util.jwt_encode(ctx.state.user, config.secret);
			await next();
			return ;
		}

		const token = getCookieToken(ctx) || getAuthorizationHeaderToken(ctx);
		ctx.state.token = token;
		try {
			ctx.state.user = token ? app.util.jwt_decode(token, config.secret, true) : {};
		} catch(e) {
			ctx.state.user = {};
		}

		await next();
	}
}
		//const Authorization =  ctx.request.header["authorization"] || ("Bearer " + ctx.cookies.get("token"));
		//const headers = {"Authorization": Authorization};
		//let user = memoryCache.get(Authorization);
		//if (!user) {
			//user = await axios.get(config.keepworkBaseURL + "user/tokeninfo", {headers})
				//.then(res => res.data)
				//.catch(e => {console.log(e); return undefined;});
			//if (user && user.userId) {
				//memoryCache.put(Authorization, user, 1000 * 60 * 60);
			//}
		//}
		//ctx.state.user = user || {};
		//console.log(ctx.state.user);
