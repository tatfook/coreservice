const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const PBlock = class extends Controller {
	get modelName() {
		return "pBlocks";
	}

	async use() {
		const {id} = this.validate({id:"number"});
		
		await this.model.pBlocks.increment({
			useCount:1,
		}, {
			where: {id},
		});

		return this.success();
	}
}

module.exports = PBlock;
