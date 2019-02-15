
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const Game = class extends Controller {
	get modelName() {
		return "games";
	}
}

module.exports = Game;
