const _ = require("lodash");

const Controller = require("../core/controller.js");
const {
	ENTITY_TYPE_USER,        // 用户类型
} = require("../core/consts.js");

const ProjectRates = class extends Controller {
	get modelName() {
		return "projectRates";
	}

	async index() {
		await this.model.projectRates.statisticsRate({projectId:310, rate:20}, "create");

		return this.success();
	}
}

module.exports = ProjectRates;
