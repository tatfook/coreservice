
const _ = require("lodash");
const Controller = require("../core/controller.js");

const Admin = class extends Controller {
	parseParams() {
		const params = this.validate();
		const resourceName = params["resources"] || "";

		delete params.resources;

		this.resource = this.ctx.model[resourceName];

		if (!this.resource) this.ctx.throw(400, "args error");

		this.adminAuthenticated();

		return params;
	}
	
	async login() {
		const config = this.app.config.self;
		const util = this.app.util;
		let {username, password} = this.validate({
			"username":"string",
			"password":"string",
		});
		username = username.toLowerCase();

		let user = await this.model.admins.findOne({
			where: {
				[this.model.Op.or]: [{username: username}, {cellphone:username}, {email: username}],
				password: this.app.util.md5(password),
			},
		});

		if (!user) return this.fail(1);
		user = user.get({plain:true});

		const tokenExpire = 3600 * 24 * 2;
		const token = util.jwt_encode({
			userId: user.id, 
			roleId: user.roleId,
			username: user.username
		}, config.adminSecret, tokenExpire);

		user.token = token;

		return this.success(user);
	}

	async userToken() {
		this.adminAuthenticated();
		const {userId} = this.validate({"userId": "number"});
		const user = await this.model.users.findOne({where:{id: userId}}).then(o => o && o.toJSON());
		if (!user) return this.throw(400);
		const tokenExpire = 3600;
		const config = this.app.config.self;
		const token = this.app.util.jwt_encode({
			userId: user.id, 
			username: user.username
		}, config.secret, tokenExpire);

		return this.success(token);
	}

	async query() {
		this.adminAuthenticated();

		const {sql, data} = this.validate({sql:"string"});
		const _sql = sql.toLowerCase();
		if (_sql.indexOf("select ") != 0 || 
				_sql.indexOf(";") >= 0 ||
				_sql.indexOf("upsert ") >= 0 ||
				_sql.indexOf("drop ") >= 0 ||
				_sql.indexOf("update ") >= 0 || 
				_sql.indexOf("delete ") >= 0 ||
				_sql.indexOf("create ") >= 0 ||
				_sql.indexOf("show ") >= 0 ||
				_sql.indexOf("alter ") >= 0) {
			return this.throw(404, "sql 不合法");
		}

		const list = await this.model.query(sql, {
			type: this.model.QueryTypes.SELECT,
			replacements: data,
		});

		return this.success(list);
	}

	async resourcesQuery() {
		this.adminAuthenticated();

		const query = this.parseParams();

		this.formatQuery(query);

		const list = await this.resource.findAndCount(query);

		this.success(list);
	}

	async search() {
		this.adminAuthenticated();

		const query = this.parseParams();

		this.formatQuery(query);

		const list = await this.resource.findAndCount({...this.queryOptions, where:query});

		this.success(list);
	}

	async index() {
		this.adminAuthenticated();

		const query = this.parseParams();

		this.formatQuery(query);

		const list = await this.resource.findAll({...this.queryOptions, where:query});

		this.success(list);
	}

	async show() {
		this.adminAuthenticated();

		const params = this.parseParams();
		const id = _.toNumber(params.id);

		if (!id) this.throw(400, "args error");

		const data = await this.resource.findOne({where:{id}});

		return this.success(data);
	}

	async bulkCreate() {
		this.adminAuthenticated();

		const {datas} = this.parseParams();

		const data = await this.resource.bulkCreate(datas); 

		return this.success(data);
	}

	async bulkUpdate() {
		this.adminAuthenticated();

		const {data, query, datas=[]} = this.parseParams();
		
		const data = await this.resource.update(data, {where:query});	
		for (let i = 0; i < datas.length; i++) {
			if (!datas[i].id) continue;
			await this.resource.update(datas[i], {where:{id:datas[i].id}});
		}

		return this.success(data);
	}

	async bulkDestroy() {
		this.adminAuthenticated();

		const {query, datas=[]} = this.parseParams();
		
		const data = await this.resource.destroy({where:query});	
		for (let i = 0; i < datas.length; i++) {
			if (!datas[i].id) continue;
			await this.resource.destroy({where:{id:datas[i].id}});
		}

		return this.success(data);
	}

	async create() {
		this.adminAuthenticated();

		const params = this.parseParams();

		const data = await this.resource.create(params);

		return this.success(data);
	}

	async update() {
		this.adminAuthenticated();

		const params = this.parseParams();
		const id = _.toNumber(params.id);

		if (!id) this.throw(400, "args error");

		const data = await this.resource.update(params, {where:{id}});

		return this.success(data);
	}

	async destroy() {
		this.adminAuthenticated();

		const params = this.parseParams();
		const id = _.toNumber(params.id);

		if (!id) this.throw(400, "args error");

		const data = await this.resource.destroy({where:{id}});

		return this.success(data);
	}
}

module.exports = Admin;
