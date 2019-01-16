
const _ = require("lodash");

const Controller = require("../core/controller.js");
const {
	TAG_CLASSIFY_USER,
	TAG_CLASSIFY_PROJECT,
} = require("../core/consts.js");

const SystemTag = class extends Controller {
	get modelName() {
		return "systemTags";
	}
}

module.exports = SystemTag;
