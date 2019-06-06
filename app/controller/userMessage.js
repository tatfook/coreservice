
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const Message = class extends Controller {
	get modelName() {
		return "userMessages";
	}

	async index() {
		const {userId} = this.authenticated();
		const where = this.validate();
		where.userId = userId;

		await this.model.messages.mergeMessage(userId);

		const ret = await this.model.userMessages.findAndCount({
			...this.queryOptions,
			include: [
			{
				as: "messages",
				model: this.model.messages,
			},
			],
			where,
		}).then(o => {
			o.rows = o.rows.map(o => o.toJSON());
			return o;
		});

		this.success(ret);
	}

	async allstate() {
		const {userId} = this.authenticated();

		await this.model.userMessages.update({state:1}, {where:{userId}});

		return this.success();
	}

	async setState() {
		const {userId} = this.authenticated();
		const {ids=[], state=1} = this.validate();
		if (ids.length == 0) return this.success();
		
		await this.model.userMessages.update({
			state,
		}, {
			where: {
				userId,
				id: {$in: ids},
			}
		});

		return this.success();
	}
}


module.exports = Message;
