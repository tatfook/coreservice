
const axios = require("axios");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const ProxyUser = class extends Controller {
	
	formatUserInfo(olduser, newuser) {
		const realname = newuser.realname;
		if (realname) olduser.realNameInfo = {cellphone: realname, verified: true};
	}

	// 登录
	async login() {
		const config = this.config.self;
		let {username, password} = this.validate({
			username: "string",
			password: "string",
		});
		username = username.toLowerCase();

		let user = await this.model.users.findOne({
			where: {
				[this.model.Op.or]: [{username: username}, {cellphone:username}, {email: username}],
				password: this.app.util.md5(password),
			}
		});

		if (!user) return this.success({error:{id:-1, message:"用户名密码错误"}});
		user = user.get({plain:true});

		const data = await axios.get(config.keepworkBaseURL + `user/login?username=${username}&password=${password}`).then(res => res.data).catch(e => {
			console.log("登录wikicraft失败", e);
		});
		if (!data || data.error.id != 0) return this.success(data);

		this.formatUserInfo(data.data.userinfo, user);
		return this.success(data);
	}

	// 注册
	async register() {
		const config = this.config.self;
		const {username, password} = this.validate({
			username: "string",
			password: "string",
		});
		const usernameReg = /^[\w\d]{4,30}$/;
		const words = await this.app.ahocorasick.check(username);
		if (words.length) return this.success({error:{id:-1, message:"包含铭感词", data:words}});
		if (!usernameReg.test(username)) return this.success({error:{id:-1, message:"用户名不合法"}});
		let user = await this.model.users.getByName(username);
		if (user) return this.success({error:{id:-1, message:"用户已存在"}});

		const data = await axios.post(config.keepworkBaseURL + `user/login?register=${username}&password=${password}`).then(res => res.data).catch(e => {
			console.log("创建wikicraft用户失败", e);
		});
		if (!data || data.error.id != 0) return this.success(data);
		
		user = await this.model.users.create({username, password:this.app.util.md5(password)});
		if (!user) return this.success({error:{id:-1, message:"服务器内部错误"}});

		const ok = await this.app.api.createGitUser(user);
		if (!ok) {
			await this.model.users.destroy({where:{id:user.id}});
			return this.success({error:{id:-1, message:"创建git用户失败"}});
		}
		await this.app.api.createGitProject({
			username: user.username,
			sitename: '__keepwork__',
			visibility: 'public',
		});

		this.formatUserInfo(data.data.userinfo, user);
		return this.success(data);
	}

	// profile
	async profile() {
		const {userId} = this.authenticated();	
		const config = this.app.config.self;

		const user = await this.model.users.findOne({where:{id: userId}});

		if (!user) return this.success({error:{id:-1, message:"用户不存在"}});

		const data = await axios.get(config.keepworkBaseURL + "user/getProfile", {headers:{
			"Authorization":"Bearer " + this.ctx.state.token,
		}}).then(res => res.data).catch(e => {
			console.log("获取wikicraft用户失败", e);
		});
		if (!data || data.error.id != 0) return this.success(data ||{error:{id:-1, message:"内部错误"}});

		this.formatUserInfo(data.data, user);

		return this.success(data);
	}

	async changepw() {
		const {userId} = this.authenticated();
		const config = this.app.config.self;
		const {oldpassword, newpassword} = this.validate({oldpassword:"string", newpassword:"string"});
		const data = await axios.post(config.keepworkBaseURL + `user/changepw`, {oldpassword, newpassword}, {headers:{
			"Content-Type":"application/json",
			"Authorization":"Bearer " + this.ctx.state.token,
		}}).then(res => {
			//console.log(res);
			return res.data;
		}).catch(e => {
			console.log("修改失败", e);
		});
		//console.log(data);
		if (!data || data.error.id != 0) return this.success(data || {error:{id:-1, message:"修改失败"}});

		await this.model.users.update({password:this.app.util.md5(newpassword)}, {where:{id:userId}});
		
		return  this.success({error:{id:0, message:"OK"}});
	}

	// getBaseInfoByName
	async getBaseInfoByName() {
		const {username} = this.validate({username:"string"});
		const user = await this.model.users.getByName(username);

		if (!user) return this.success({error:{id:-1, message:"用户不存在"}});
		user.displayName = user.nickname;
		user._id = user.id;
		user.defaultDataSource = {username:user.username};

		return this.success({error:{id:0, message:"OK"}, data:user});
	}
}

module.exports = ProxyUser;
