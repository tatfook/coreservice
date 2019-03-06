
const _ = require("lodash");

const Controller = require("../core/controller.js");

const ParacraftDevice = class extends Controller {
	get modelName() {
		return "ParacraftVisitors";
	}

	async upsert() {
		const data = this.validate({"username": "string", "cellphone": "string"});
		await this.model.paracraftVisitors.upsert(data);
		return this.success();
	}
}

module.exports = ParacraftDevice;
