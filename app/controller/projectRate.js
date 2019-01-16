const _ = require("lodash");

const Controller = require("../core/controller.js");
const {
	ENTITY_TYPE_USER,        // 用户类型
} = require("../core/consts.js");

const ProjectRates = class extends Controller {
	get modelName() {
		return "projectRates";
	}
}

module.exports = ProjectRates;
