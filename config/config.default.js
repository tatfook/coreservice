
exports.keys = "keepwork";

exports.cors = {
	origin: "*",
}

exports.middleware = [
	'authenticated', 
	'pagination', 
	'graphql', 
	'organization',
	'activity',
];

exports.security = {
	xframe: {
		enable: false,
	},
	csrf: {
		enable: false,
	},
}

exports.onerror = {
	all: (e, ctx) => {
		//const message = ctx.app.config.self.env == "prod" ? e.toString() : e.stack || e.message || e.toString();
		const message = ctx.app.config.self.env == "prod" ? "请求不合法" : e.stack || e.message || e.toString();

		ctx.status = e.status || 500;
		ctx.body = message;

		if (e.name == "SequelizeUniqueConstraintError") {
			ctx.status = 409;
		}
	}
}
