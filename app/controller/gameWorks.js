
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const GameWorks = class extends Controller {
	get modelName() {
		return "gameWorks";
	}

	async search() {
		const query = this.validate();
		const attributes = [["id", "userId"], "username", "nickname", "portrait", "description"];

		const list = await this.model.gameWorks.findAndCount({
			include: [
			{
				as: "projects",
				model: this.model.projects,
			}, {
				as: "users",
				attributes,
				module: this.model.users,
			},
			],
			where: query,
		});
		//}).then(list => list.map(o => o.toJSON()));
		return this.success(list);
	}
}

module.exports = GameWorks;