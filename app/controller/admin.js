
const _ = require("lodash");
const Controller = require("../core/controller.js");

const Admin = class extends Controller {
	parseParams() {
		const params = this.ctx.params || {};
		const resourceName = params["resources"] || "";

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

	async index() {
		this.parseParams();
		const {ctx} = this;

		const query = ctx.query || {};
		const list = await this.resource.findAll({where:query});

		this.success(list);
	}

	async show() {
		this.parseParams();
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);

		if (!id) ctx.throw(400, "args error");

		const data = await this.resource.findOne({where:{id}});

		return this.success(data);
	}

	async create() {
		this.parseParams();
		const {ctx} = this;
		const params = ctx.request.body;

		const data = await this.resource.create(params);

		return this.success(data);
	}

	async update() {
		this.parseParams();
		const {ctx} = this;
		const params = ctx.request.body;
		const id = _.toNumber(ctx.params.id);

		if (!id) ctx.throw(400, "args error");

		const data = await this.resource.update(params, {where:{id}});

		return this.success(data);
	}

	async destroy() {
		this.parseParams();
		const {ctx} = this;
		const id = _.toNumber(ctx.params.id);

		if (!id) ctx.throw(400, "args error");

		const data = await this.resource.destroy({where:{id}});

		return this.success(data);
	}
}

module.exports = Admin;
