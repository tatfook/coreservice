const joi = require("joi");
const axios = require("axios");
const uuidv1 = require('uuid/v1');
const moment = require("moment");
const Base64 = require('js-base64').Base64;
const _ = require("lodash");

const consts = require("../core/consts.js");
const Controller = require("../core/controller.js");

const User = class extends Controller {
	get modelName() {
		return "users";
	}

	tokeninfo() {
		return this.success(this.authenticated());
	}

	async search() {
		const query = this.validate();

		this.formatQuery(query);

		const attributes = ["id", "username", "nickname", "portrait", "email"];
		const data = await this.model.users.findAndCount({...this.queryOptions, attributes, where:query});

		return this.success(data);
	}

	async index() {
		const query = this.validate();

		this.formatQuery(query);

		const attributes = ["id", "username", "nickname", "portrait", "email"];
		const list = await this.model.users.findAll({...this.queryOptions, attributes, where:query});

		return this.success(list);
	}

	async show() {
		const {ctx, model} = this;
		const {id} = this.validate();

		const userId = _.toNumber(id);
		const user = userId ?  await model.users.getById(userId) :	await model.users.getByName(id);

		if (!user) return this.throw(404);

		return this.success(user);
	}

	async update() {
		const {ctx} = this;
		const {userId, username} = this.authenticated();
		const params = this.validate();

		delete params.id;
		delete params.password;
		delete params.username;
		delete params.roleId;

		const ok = await ctx.model.users.update(params, {where:{id:userId}});

		return this.success(ok && ok[0] == 1);
	}

	async login() {
		const config = this.app.config.self;
		const util = this.app.util;
		let {username, password} = this.validate({
			"username":"string",
			"password":"string",
		});
		username = username.toLowerCase();

		let user = await this.model.users.findOne({
			where: {
				[this.model.Op.or]: [{username: username}, {cellphone:username}, {email: username}],
				password: this.app.util.md5(password),
			},
		});
		
		if (!user) return this.fail(1);
		user = user.get({plain:true});

		//if (model.roles.isExceptionRole(user.roleId)) this.throw(403, "异常用户");

		const tokenExpire = config.tokenExpire || 3600 * 24 * 2;
		const token = util.jwt_encode({
			userId: user.id, 
			roleId: user.roleId,
			username: user.username
		}, config.secret, tokenExpire);

		//console.log(config.tokenExpire);

		user.token = token;
		//user.roleId = roleId;
		this.ctx.cookies.set("token", token, {
			httpOnly: false,
			maxAge: tokenExpire * 1000,
			overwrite: true,
			domain: "." + config.domain,
		});

		return this.success(user);
	}

	async platformLogin() {
		const config = this.config.self;
		const params = this.validate({uid:"string", token:"string", platform:"string"});
		let username = "qh" + uuidv1().replace(/-/g, "");
		const password = username + _.random(100, 999);
		const oauthTypes = {qqHall: consts.OAUTH_SERVICE_TYPE_QQ_HALL};
		const oauthType = oauthTypes[params.platform];
		params["is_need_user_info"] = true;

		if (oauthType == undefined) return this.throw(400, 参数错误);

		const qq = await axios.post(config.paracraftWorldLoginUrl, params).then(res => res.data);
		if (qq.data.status != 0) return this.throw(400, "平台登录失败"); 
		qq.data.user_info.nickname = Base64.decode(qq.data.user_info.nickname);

		let user = undefined, payload = {external:true};
		let oauthUser = await this.model.oauthUsers.findOne({where:{externalId:params.uid, type: oauthType}});

		if (oauthUser && oauthUser.userId) {
			user = await this.model.users.findOne({where:{id:oauthUser.userId}});
			user = user && user.get({plain:true});
		}
		
		if (!user) {  // 用户不存在则注册用户
			user = await this.model.users.create({
				username: username,
				password: this.app.util.md5(password),
			});
			if (!user) return this.fail(0);
			user = user.get({plain:true});
			username = "qh" + moment().format("YYYYMMDD") + user.id;
			await this.model.users.update({username, nickname:username}, {where:{id: user.id}});
			user.username = user.nickname = username;

			// 同步用户到wikicraft
			const data = await axios.post(config.keepworkBaseURL + "user/register", {username, password}).then(res => res.data).catch(e => console.log("创建wikicraft用户失败", e));
			if (!data || data.error.id != 0) {
				await this.model.users.destroy({where:{id:user.id}});
				console.log("创建wikicraft用户失败", data);
				return this.fail(-1, 400, data);
			} 
			const ok = await this.app.api.createGitUser({
				id: user.id,
				username: username,
				password: password,
				extra:{external: true},
			});
			if (!ok) {
				await this.model.users.destroy({where:{id:user.id}});
				return this.fail(6);
			}
			await this.app.api.createGitProject({
				username: user.username,
				sitename: '__keepwork__',
				visibility: 'public',
			});

			await this.model.oauthUsers.upsert({
				userId: user.id,
				externalId: params.uid,
				type: oauthType,
			});
		}

		payload.userId = user.id;
		payload.username = user.username;
		delete user.password;
		const token = this.app.util.jwt_encode(payload, config.secret, config.tokenExpire);

		return this.success({kp:{user, token}, qq});
	}

	async register() {
		const {ctx} = this;
		const {model, util} = this.app;
		const config = this.app.config.self;
		const usernameReg = /^[\w\d]{4,30}$/;
		const params = this.validate({
			//"cellphone":"string",
			//"captcha":"string",
			"username":"string",
			"password":"string",
		});
		const {username, password} = params;

		const words = await this.app.ahocorasick.check(params.username);
		if (words.length) return this.fail(8);
		if (!usernameReg.test(params.username)) return this.fail(2);
		let user = await model.users.getByName(params.username);
		if (user) return this.fail(3);

		// 同步用户到wikicraft
		const data = await axios.post(config.keepworkBaseURL + "user/register", {username, password}).then(res => res.data).catch(e => {
			console.log("创建wikicraft用户失败", e);
		});
		if (!data || data.error.id != 0) {
			console.log("创建wikicraft用户失败", data);
			return this.fail(-1, 400, data);
		} 

		const cellphone = params.cellphone;
		if (cellphone) {
			const cache = await this.app.model.caches.get(cellphone) || {};
			if (!params.captcha || !cache.captcha || cache.captcha != params.captcha){
				if (!cache.captcha) return this.fail(4);
				if (cache.captcha != params.captcha) return this.fail(5);
			} 
			const isBindCellphone = await model.users.findOne({where:{cellphone}});
			if (isBindCellphone) delete params.cellphone;
		}

		user = await model.users.create({
			cellphone: params.cellphone,
			nickname: params.nickname || params.username,
			username: params.username,
			password: util.md5(params.password),
			realname: cellphone,
		});

		if (!user) return this.fail(0);
		user = user.get({plain:true});

		const ok = await this.app.api.createGitUser({
			id: user.id,
			username: user.username,
			password: params.password,
		});
		if (!ok) {
			await this.model.users.destroy({where:{id:user.id}});
			return this.fail(6);
		}
		await this.app.api.createGitProject({
			username: user.username,
			sitename: '__keepwork__',
			visibility: 'public',
		});

		if (params.oauthToken) {
			await model.oauthUsers.update({userId:user.id}, {where:{token:params.oauthToken}});
		}

		const tokenExpire = config.tokenExpire || 3600 * 24 * 2;
		const token = util.jwt_encode({
			userId: user.id, 
			username: user.username,
			roleId: user.roleId,
		}, config.secret, tokenExpire);

		user.token = token;
		ctx.cookies.set("token", token, {
			httpOnly: false,
			maxAge: tokenExpire * 1000,
			overwrite: true,
			domain: "." + config.domain,
		});

		return this.success(user);
	}

	logout() {
		const {ctx} = this;
		const config = this.app.config.self;

		ctx.cookies.set("token", "", {
			maxAge: 0,
			overwrite: true,
			domain: "." + config.domain,
		});

		return this.success();
	}

	async changepwd() {
		const {ctx, util, model} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({
			password:"string",
			oldpassword:"string",
		});

		const result = await model.users.update({
			password: util.md5(params.password),
		}, {
			where: {
				id: userId,
				password: util.md5(params.oldpassword),
			}
		});

		return this.success(result && result[0] == 1);
	}

	// 手机验证第一步
	async cellphoneVerifyOne() {
		const {ctx, app} = this;
		const {model} = this.app;
		const params = this.validate({
			cellphone:"string",
		});
		const cellphone = params.cellphone;
		const captcha = _.times(4, () =>  _.random(0,9,false)).join("");

		const ok = await app.sendSms(cellphone, [captcha, "3分钟"]);
		
		await app.model.caches.put(cellphone, {captcha}, 1000 * 60 * 3); // 10分钟有效期

		if (!ok) return this.throw(500, "请求次数过多");
		//console.log(captcha);
		return this.success();
	}
	
	// 手机验证第二步  ==> 手机绑定
	async cellphoneVerifyTwo() {
		const userId = this.authenticated().userId;
		const params = this.validate({
			cellphone:"string",
			captcha:"string_optional",
			password: "string_optional",
		});
		let cellphone = params.cellphone;
		// 解绑有密码 优先密码验证
		if (!params.isBind && params.password) {
			const ok = await this.model.users.update({cellphone: null}, {where:{id:userId, password: this.util.md5(params.password)}});
			return this.success(ok);
		}
		
		const captcha = params.captcha;
		const cache = await this.model.caches.get(cellphone);
		//console.log(cache, cellphone, captcha, userId);
		if (!captcha || !cache || cache.captcha != captcha) {
			if (!cache) this.throw(400, "验证码过期");
			if (!captcha || cache.captcha != captcha) return this.throw(400, "验证码错误" + cache.captcha + "-" + captcha);
		}
		
		if (params.realname) {
			await this.model.users.update({realname: cellphone}, {where:{id:userId}});
			return this.success("OK");
		}

		if (!params.isBind) cellphone = "";

		await this.model.users.update({cellphone}, {where:{id:userId}});
		return this.success("OK");
	}

	// 邮箱验证第一步
	async emailVerifyOne() {
		const {ctx, app} = this;
		const {model} = this.app;
		const params = this.validate({
			email:"string",
		});
		const email = params.email;
		const captcha = _.times(4, () =>  _.random(0,9,false)).join("");

		const body = `<h3>尊敬的KEEPWORK用户:</h3><p>您好: 您的邮箱验证码为${captcha}, 请在10分钟内完成邮箱验证。谢谢</p>`;
		const ok = await app.sendEmail(email, "KEEPWORK 邮箱绑定验证", body);
		//console.log(captcha);
		await app.model.caches.put(email, {captcha}, 1000 * 60 * 10); // 10分钟有效期

		return this.success();
	}
	
	// 邮箱验证第二步  ==> 手机绑定
	async emailVerifyTwo() {
		const {ctx, app} = this;
		const {model} = this.app;
		const userId = this.authenticated().userId;
		const params = this.validate({
			email:"string",
			captcha:"string_optional",
			password: "string_optional",
		});

		let email = params.email;

		// 解绑有密码 优先密码验证
		if (!params.isBind && params.password) {
			const ok = await this.model.users.update({email: null}, {where:{id:userId, password: this.util.md5(params.password)}});
			return this.success(ok);
		}
		const captcha = params.captcha;
		
		const cache = await app.model.caches.get(email);
		//console.log(cache, email, captcha, userId);
		if (!captcha || !cache || cache.captcha != captcha) {
			if (!cache) ctx.throw(400, "验证码过期");
			if (!captcha || cache.captcha != captcha) return ctx.throw(400, "验证码错误");
		}
		
		if (!params.isBind) email = null;

		const result = await model.users.update({email}, {where:{id:userId}});

		return this.success(result && result[0] == 1);
	}

	async profile() {
		const {userId} = this.authenticated();

		const user = await this.model.users.getById(userId);
		return this.success(user);

		//const data = await this.model.users.findOne({
			//where:{id:userId},
			//exclude: ["password"],
			//include:[
			//{
				//model:this.model.profiles,
				//as:"profile",
			//}
			//],
		//});

		//return this.success(data);
	}

	async setProfile() {
		const {userId} = this.authenticated();
		const params = this.validate();
		params.userId = userId;

		await this.model.profiles.upsert(params);

		return this.success("OK");
	};

	async detail() {
		const {id} = this.validate({id:'int'});
		const user = await this.model.users.getById(id);
		if (!user) this.throw(400);

		const rank = await this.model.userRanks.getByUserId(id);
		const contributions = await this.model.contributions.getByUserId(id);

		user.rank = rank;
		user.contributions = contributions;

		return this.success(user);
	}

	async sites() {
		const {id} = this.validate();
		const user = await this.model.users.get(id);

		if (!user) return this.success([]);

		const userId = user.id;
		const sites = await this.model.sites.get(userId);
		const joinSites = await this.model.sites.getJoinSites(userId, 0);

		return this.success(sites.concat(joinSites));
	}
	
	// 增加用户活跃度
	async addContributions() {
		const {userId} = this.authenticated();
		const {id, count=1} = this.validate({id:"int", count:"int_optional"});
		
		await this.model.contributions.addContributions(userId, count);

		return this.success("OK");
	}

	// 获取用户的活跃度
	async contributions() {
		const {id} = this.validate({id:'int'});
		const data = await this.model.contributions.getByUserId(id);

		return this.success(data);
	}
}

module.exports = User;
