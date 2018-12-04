
const _ = require("lodash");
const axios = require("axios");
const pathToRegexp = require('path-to-regexp');

const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
} = require("../core/consts.js");

class Api  {
	constructor(config, app) {
		this.config = config;
		this.app = app;
	}
	
	curlConfig(token, baseURL) {
		return {
			headers: {
				"Authorization":"Bearer " + token,
			},
			baseURL: baseURL,
		}
	}

	async curl(method, url, data, config = {}) {
		url = config.baseURL + pathToRegexp.compile(url)(data || {});
		method = (method || "get").toLowerCase();
		config = {...config, method, url};
		if (method == "get" || method == "delete" || method == "head" || method == "options") {
			config.params = data;
		} else {
			config.data = data;
		}

		this.app.logger.debug(`发送请求: ${url}`);
		return axios.request(config)
			.then(res => {
				console.log(`请求:${url}成功`, JSON.stringify(res.config));
				this.app.logger.debug(`请求:${url}成功`, JSON.stringify(res.config));
				this.app.log.debug(`请求:${method} ${url}成功`, res.config);
				return res.data;
			})
			.catch(res => {
				console.log(res.response.status, res.response.data);
				this.app.log.debug(`请求:${method} ${url}失败`, res.response.status, res.response.data);
				this.app.logger.debug(`请求:${url}失败`, res.responsestatus, res.response.data);
			});

	}

	get gitConfig() {
		return this.curlConfig(this.config.adminToken, this.config.gitBaseURL);
	}

	get esConfig() {
		return this.curlConfig(this.config.adminToken, this.config.esBaseURL);
	}

	async createGitUser(data) {
		return await this.curl("post", "/accounts", data, this.gitConfig);
	}

	async createGitProject(data) {
		return await this.curl("post", "/projects/user/:username", data, this.gitConfig);
	}
	
	async deleteGitProject(data) {
		const url = "/projects/" + encodeURIComponent(data.username + "/" + data.sitename);
		return await this.curl('delete', url, {}, this.gitConfig);
	}

	async setGitProjectVisibility(data) {
		const url = "/projects/" + encodeURIComponent(data.username + "/" + data.sitename) + "/visibility";

		return await this.curl('put', url, data, this.gitConfig);
	}

	async favorites(favorite) {
		if (favorite.objectType == ENTITY_TYPE_USER) {
			const fansUser = await this.app.model.users.getById(favorite.objectId);
			const followUser = await this.app.model.users.getById(favorite.userId);

			await this.usersUpsert(fansUser);
			await this.usersUpsert(followUser);
		}
	}

	async favoritesUpsert(favorite) {
		await this.favorites(favorite);
	}

	async favoritesDestroy(favorite) {
		await this.favorites(favorite);
	}

	async usersUpsert(inst) {
		if (!inst) return console.log("参数为空");
		inst = inst.get ? inst.get({plain:true}) : inst;

		_.each(inst, (val, key) => {
			if (val == null) delete inst[key];
		});

		const userId = inst.id;
		inst.projectCount = await this.app.model.projects.count({where:{userId}});
		inst.fansCount = await this.app.model.favorites.count({where:{objectId:userId, objectType: ENTITY_TYPE_USER}});
		inst.followCount = await this.app.model.favorites.count({where:{userId, objectType: ENTITY_TYPE_USER}});
		return this.curl('post', `/users/${inst.id}/upsert`, {
		//return await this.curl('post', `/users/${inst.id}/upsert`, {
			id: inst.id,
			username: inst.username,
			portrait: inst.portrait,
			description: inst.description,
			total_fans: inst.fansCount,
			total_projects: inst.projectCount,
			total_follows: inst.followCount,
			created_time: inst.createdAt,
			updated_time: inst.updatedAt, 
		}, this.esConfig);
	}

	async sitesUpsert(inst) {
		//_.each(inst, (val, key) => {
			//if (val == null) delete inst[key];
		//});

		//return this.curl('post', `/sites/${inst.id}/upsert`, {
		////return await this.curl('post', `/sites/${inst.id}/upsert`, {
			//id: inst.id,
			//username: inst.username,
			//sitename: inst.sitename,
			//display_name: inst.displayName,
			//cover: inst.extra.imageUrl,
			//description: inst.description,
			//created_time: inst.createdAt,
		//}, this.esConfig);
	}

	async projectsUpsert(inst) {
		_.each(inst, (val, key) => {
			if (val == null) delete inst[key];
		});

		const tags = (inst.tags || "").split("|").filter(o => o);
		const user = await this.app.model.users.findOne({where:{id:inst.userId}});
		if (inst.createdAt == inst.updatedAt) await this.usersUpsert(user);

		if (!user) return;

		return this.curl('post', `/projects/${inst.id}/upsert`, {
		//return await this.curl('post', `/projects/${inst.id}/upsert`, {
			id: inst.id,
			name: inst.name,
			username: user.username,
			user_portrait: user.portrait,
			visibility: inst.visibility == 0 ? "public" : "private",
			recruiting: (inst.privilege & 1) ? true : false,
			type: inst.type == 1 ? "paracraft" : "site",
			created_time: inst.createdAt,
			cover: inst.extra.imageUrl,
			description: inst.description,
			total_like: inst.star,
			total_view: inst.visit,
			total_mark: inst.favorite,
			total_comment: inst.comment,
			recent_like: inst.lastStar,
			recent_view: inst.lastVisit,
			updated_time: inst.updatedAt,
		}, this.esConfig);
	}

	async packagesUpsert(inst) {
		return this.curl('post', `/packages/${inst.id}/upsert`, {
		//return await this.curl('post', `/projects/${inst.id}/upsert`, {
			id: inst.id,
			title: inst.packageName,
			description: inst.description,
			age_min: inst.minAge,
			age_max: inst.maxAge,
			cover: inst.extra.coverUrl,
			recent_view: 0,
		}, this.esConfig);
	}

	async usersDestroy({id}) {
		return await this.curl('delete', `/users/${id}`, {}, this.esConfig);
	}

	async sitesDestroy({id}) {
		//return await this.curl('delete', `/sites/${id}`, {}, this.esConfig);
	}

	async projectsDestroy({id, userId}) {
		const user = await this.app.model.users.findOne({where:{id:userId}});
		await this.usersUpsert(user);

		return await this.curl('delete', `/projects/${id}`, {}, this.esConfig);
	}

	async packagesDestroy({id}) {
		return await this.curl('delete', `/packages/${id}`, {}, this.esConfig);
	}
}

module.exports = app => {
	const config = app.config.self;

	config.adminToken = app.util.jwt_encode({userId:1, username:"xiaoyao", roleId:10}, config.secret, 3600 * 24 * 365 * 10);
	app.api = new Api(config, app);
}

