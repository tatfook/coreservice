
const _ = require("lodash");
const Controller = require("../core/controller.js");


class Index extends Controller {
	async index() {
		await this.model.query("select * from users where id in (:ids)", {
			type: this.model.QueryTypes.SELECT,
			replacements: {
				ids: [1,2,1],
			}
		});
		this.ctx.status = 200;
		this.ctx.body = "hello world";
	}

	async test() {

	}
}

module.exports = Index;
