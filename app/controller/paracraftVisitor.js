
const _ = require("lodash");

const Controller = require("../core/controller.js");

const ParacraftVisitors = class extends Controller {
	get modelName() {
		return "ParacraftVisitors";
	}

	async upsert() {
		const data = this.validate({"realname": "string", "cellphone": "string"});
		await this.model.paracraftVisitors.upsert(data);

		//if (data.email) {
			//await this.ctx.service.email.send(data.email, "KEEPWORK合作邀请", "this is a test");
		//}
		return this.success();
	}
}

module.exports = ParacraftVisitors;
