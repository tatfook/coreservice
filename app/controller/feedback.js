
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const Feedback = class extends Controller {
	get modelName() {
		return "feedbacks";
	}

	async create() {
		const {userId, username} = this.getUser() || {};
		const data = this.validate({url:"string"});

		const ret = await this.model.feedbacks.create({...data, userId, username});

		return this.success(ret);
	}
}

module.exports = Feedback;
