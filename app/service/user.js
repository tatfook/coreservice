'use strict';

const _ = require('lodash');
const Service = require('egg').Service;

class User extends Service {

	async token(payload, clear) {
		const config = this.app.config.self;
		const tokenExpire = config.tokenExpire || 3600 * 24 * 2;
		const token = this.app.util.jwt_encode(payload, config.secret, tokenExpire);

		await this.setToken(payload.userId, token, clear);

		return token;
	}

	async setToken(userId, token, clear = false) {
		const data = await this.app.model.userdatas.get(userId);
		
		data.tokens = data.tokens || [];
		if (clear) data.tokens = [];

    data.tokens.splice(0, 0, token);
    // 只支持10个token
    if (data.tokens.length > 20) data.tokens.pop();
    await this.app.model.userdatas.set(userId, data);
  }

	async validateToken(userId, token) {
		const data = await this.app.model.userdatas.get(userId);
		const tokens = data.tokens || [];
		//console.log(userId, data, token);
		return _.find(tokens, o => o == token) ? true : false;
	}

	async createRegisterMsg(user) {
		const msg = await this.app.model.messages.create({
			sender:0,
			type: 0,
			all: 0,
			msg: {
				type: 1, 
				user: {
					...user,
					password: undefined,
				},
			},
			extra:{},
		}).then(o => o && o.toJSON());
		return await this.app.model.userMessages.create({userId: user.id, messageId:msg.id, state:0}).then(o => o && o.toJSON());
	}

	async register(user) {
		await this.createRegisterMsg(user);
	}
}

module.exports = User;
