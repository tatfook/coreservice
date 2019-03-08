
const _ = require("lodash");

const Controller = require("../core/controller.js");

const ParacraftNews = class extends Controller {
	get modelName() {
		return "ParacraftNews";
	}

	async index() {
		const data = await this.model.ParacraftNews.findAndCount({
			...this.queryOptions,
		});

		return this.success(data);
	}
}

module.exports = ParacraftNews;
