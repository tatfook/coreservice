
const _ = require("lodash");
const DataLoader = require('dataloader');

module.exports = {
	authenticated() {
		const user = this.state.user;
		if (!user || user.userId == undefined) return this.throw(401);
		return user;
	},

	adminAuthenticated() {
		const config = this.config.self;
		const token = this.ctx.token;
		const user = this.app.util.jwt_decode(token || "", config.adminSecret, true);
		if (!user) return this.throw(401);
		
		return user;
	},

	getLoader({modelName, batchFn, loaderName, model="model"}) {
		const app = this.app;
		const Op = app.Sequelize.Op;
		this.loader = this.loader || {};
		loaderName = loaderName || modelName;
		batchFn = batchFn || ((keys) => app[model][modelName].findAll({where: {id: {[Op.in]: keys}}}));
		this.loader[loaderName] = this.loader[loaderName] || new DataLoader(batchFn);
		return this.loader[loaderName];
	},
}
