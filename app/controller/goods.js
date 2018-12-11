
const _ = require("lodash");
const moment = require("moment");

const Controller = require("../core/controller.js");
const {
	GOODS_PLATFORM_KEEPWORK,   // keepwork 
	GOODS_PLATFORM_LESSON,     // lesson
	GOODS_PLATFORM_HAQI,       // haqi
} = require("../core/consts.js");

const Goods = class extends Controller {
	get modelName() {
		return "goods";
	}

	async create() {
		return this.success("OK");
	}
	async destroy() {
		return this.success("OK");
	}
	async update() {
		return this.success("OK");
	}

	async index() {
		const query = this.validate();

		this.formatQuery(query);

		const list = await model.findAll({...this.queryOptions, where:query});

		return this.success(list);
	}
}

module.exports = Goods;
