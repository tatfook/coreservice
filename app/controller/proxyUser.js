
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

		const tokenExpire = config.tokenExpire || 3600 * 24 * 2;
		const token = this.app.util.jwt_encode({
			userId: user.id, 
			username: user.username,
			roleId: user.roleId,
		}, config.secret, tokenExpire);

		await this.ctx.service.user.setToken(user.id, token);

		return this.success({
			error: {
				message:"success",
				id:0,
			},
			data: {
				userinfo: {
					...user,
					_id. user.id,
					joindate: user.createdAt,
					displayName: user.nickname,,
					realNameInfo: {
						cellphone: user.realname,
						verified: user.realname ? true : false,

					}
				},
				token,
			}
		});
		const data = await axios.get(config.keepworkBaseURL + "user/getProfile", {headers:{
			"Content-Type":"application/json",
			"Authorization":"Bearer " + token,
		}}).then(res => res.data).catch(e => {
			console.log("获取wikicraft用户失败", e);
		});
		if (!data || data.error.id != 0) return this.success(data ||{error:{id:-1, message:"内部错误"}});
		this.formatUserInfo(data.data, user);
		
		//const data = await axios.get(config.keepworkBaseURL + `user/login?username=${username}&password=${password}`).then(res => res.data).catch(e => {
			//console.log("登录wikicraft失败", e);
		//});
		//if (!data || data.error.id != 0) return this.success(data);
		//this.formatUserInfo(data.data.userinfo, user);

		data.data = {userinfo: data.data, token};
		
		await this.ctx.service.user.setToken(user.id, token);

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

		const data = await axios.post(config.keepworkBaseURL + `user/register`, {username, password}, {headers:{
			"Content-Type":"application/json",
		}}).then(res => res.data).catch(e => {
			console.log("创建wikicraft用户失败", e);
		});
		if (!data || data.error.id != 0) return this.success(data || {error:-1, message:"wikicraft用户创建失败"});
		
		user = await this.model.users.create({
			username: username.toLowerCase(),
		   	password:this.app.util.md5(password)});
		if (!user) return this.success({error:{id:-1, message:"服务器内部错误"}});

		const ok = await this.app.api.createGitUser(user);
		if (!ok) console.log("创建git用户失败");
		await this.app.api.createGitProject({
			username: user.username,
			sitename: '__keepwork__',
			visibility: 'public',
		});

		this.formatUserInfo(data.data.userinfo, user);
		const token = data.data.token;

		// 用户注册
		await this.ctx.service.user.register(user);
		await this.ctx.service.user.setToken(user.id, token);

		return this.success(data);
	}

	// profile
	async profile() {
		const {userId} = this.authenticated();	
		const config = this.app.config.self;

		const user = await this.model.users.findOne({where:{id: userId}});

		if (!user) return this.success({error:{id:-1, message:"用户不存在"}});

		return this.success({
			error: {
				message:"success",
				id:0,
			},
			data: {
				...user,
				_id. user.id,
				joindate: user.createdAt,
				displayName: user.nickname,,
				realNameInfo: {
					cellphone: user.realname,
					verified: user.realname ? true : false,

				}
			}
		});
		//const data = await axios.get(config.keepworkBaseURL + "user/getProfile", {headers:{
			//"Content-Type":"application/json",
			//"Authorization":"Bearer " + this.ctx.state.token,
		//}}).then(res => res.data).catch(e => {
			//console.log("获取wikicraft用户失败", e);
		//});
		//if (!data || data.error.id != 0) return this.success(data ||{error:{id:-1, message:"内部错误"}});

		//this.formatUserInfo(data.data, user);

		//return this.success(data);
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

	async batchChangePwd() {
		const {list=[]} = this.validate();
		const config = this.config.self;
		
		const token = this.app.util.jwt_encode({roleId:10, username:"xiaoyao", userId:3}, config.secret);
		const auth = "Bearer " + token;
		console.log(auth);
		for (let i = 0; i < list.length; i++) {
			const item = list[i];
			const md5password = this.app.util.md5(item.password);
			const user = await this.model.users.findOne({where:{username: item.username}});
			if (!user) {
				item.result = "用户不存在";
				continue;
			};
			let result = await axios.post(config.keepworkBaseURL + 'tabledb/query', {
				tableName:"user",
				page:1,
				pageSize:10,
				query: {
					username: item.username,
				}
			}, {
				headers: {
					"Content-Type":"application/json",
					"Authorization": auth,
				}
			}).then(res => res.data).catch(e => console.log(e));

			if (!result || !result.data || result.data.total != 1) {
				item.result = "旧用户不存在";
				continue;
			}
			const oldUser = result.data.data[0];
			if (md5password != user.password && md5password != oldUser.password) {
				item.password = "密码错误";
				continue;
			}
			const newpassword = this.app.util.md5(item.newpassword || item.password);
			result = await axios.post(config.keepworkBaseURL + 'tabledb/upsert', {
				tableName:"user",
				query: {
					_id: oldUser._id,
					password: newpassword,
				}
			}, {
				headers: {
					"Content-Type":"application/json",
					"Authorization": auth,
				}
			}).then(res => res.data).catch(e => console.log(e));
			if (!result || !result.error || result.error.id != 0) {
				item.result = "设置旧密码失败";
				continue;
			}

			await this.model.users.update({password: newpassword}, {where:{id:user.id}});
			item.result = "密码修改成功";
		}
		return this.success(list);
	}

	// getBaseInfoByName
	async getBaseInfoByName() {
		const {username} = this.validate({username:"string"});
		const user = await this.model.users.getByName(username);

		if (!user) return this.success({error:{id:-1, message:"用户不存在"}});
		user.displayName = user.nickname;
		user._id = user.id;
		user.defaultDataSource = {};

		return this.success({error:{id:0, message:"OK"}, data:user});
	}
}

module.exports = ProxyUser;
