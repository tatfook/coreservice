
const _ = require("lodash");
const Controller = require("../core/controller.js");

const ProxyOauthApp = class extends Controller {

	async agreeOauth() {
		const {userId, username} = this.authenticated();
		const {client_id, state} = this.validate({client_id: "string"});

		const code = userId + "_" + _.random(1000000, 9999999);
		await this.model.caches.set(`oauth_code_${client_id}_${code}`, {userId, username}, 1000 * 60 * 10);

		return this.success({error:{id:0, message:"OK"}, data:{code, state}});
	}

	async getTokenByCode() {
		const {client_id, code, client_secret, username} = this.validate({
			client_id: "string",
			code: "string",
			client_secret: "string",
		});

		const cache = await this.model.caches.get(`oauth_code_${client_id}_${code}`);
		if (!cache) return this.success({error:10001, message:"authorized code invalid"}, 503);
		if (username && cache.username != username) this.success({error:10003, message:"username error"}, 503);

		const user = await this.model.users.getById(cache.userId);
		if (!user) return this.success({error:10002, message:"server inner errror"}, 503);

		const config = this.config.self;
		const tokenExpire = config.tokenExpire || 3600 * 24 * 2;
		const token = this.app.util.jwt_encode({
			authway:"oauth",
			userId: user.id, 
			username: user.username,
		}, config.secret, tokenExpire);

		await this.ctx.service.user.setToken(user.id, token);

		return this.success({token});
	}
}

module.exports = ProxyOauthApp;
