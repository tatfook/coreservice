
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const GameWorks = class extends Controller {
	get modelName() {
		return "gameWorks";
	}
}

module.exports = GameWorks;
