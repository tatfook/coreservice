const _ = require("lodash");

const Controller = require("../core/controller.js");

const OauthApp = class extends Controller {
	get modelName() {
		return "oauthApps";
	}

	// 密码式认证
	async login() {
		let {username, password} = this.validate({
			username: "string",
			password: "string",
		});
		username = username.toLowerCase();

		const user = await this.model.users.findOne({
			where: {
				[this.model.Op.or]: [{username: username}, {cellphone:username}, {email: username}],
				password: this.app.util.md5(password),
			},
		}).then(o => o && o.toJSON());
		
		if (!user) return this.fail({code:1, message:"用户名密码错误"});

		user.password = undefined;
		const token = await this.ctx.service.user.token({userId: user.id, username: user.username, authway:"oauth"});

		return this.success({token, user});
	}

	// 获取认证码
	async oauthCode() {
		const {userId, username} = this.authenticated();
		const {client_id, state} = this.validate({client_id: "string"});

		const app = await this.model.oauthApps.findOne({where: {clientId: client_id}}).then(o => o && o.toJSON());
		if (!app) return this.fail({code:1, messaeg:"应用不存在"});

		const code = userId + "_" +  _.random(1000000, 9999999);
		await this.model.caches.set(`oauth_code_${client_id}_${code}`, {userId, username, clientId: app.clientId, clientSecret: app.clientSecret}, 1000 * 60 * 10);

		return this.success({code, state});
	}

	// 通过认证码获取token
	async oauthToken() {
		const {client_id, code, client_secret} = this.validate({
			client_id: "string",
			client_secret: "string",
			code: "string",
		});

		const cache = await this.model.caches.get(`oauth_code_${client_id}_${code}`);
		if (!cache) return this.fail({code:2, messae:"无效授权码"});
		if (cache.clientSecret !== client_secret || cache.clientId !== client_id) return this.fail({code:3, message:"授权口令错误"});

		const config = this.config.self;
		const tokenExpire = config.tokenExpire || 3600 * 24 * 2;
		const token = this.app.util.jwt_encode({
			authway:"oauth",
			userId: cache.userId, 
			username: cache.username,
		}, config.secret, tokenExpire);

		await this.ctx.service.user.setToken(cache.userId, token);

		return this.success({token});
	}
}

module.exports = OauthApp;
