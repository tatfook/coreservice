
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const GameWorks = class extends Controller {
	get modelName() {
		return "gameWorks";
	}

	async search() {
		const query = this.validate();
		const attributes = ["id", "username", "nickname", "portrait"];

		const list = await this.model.gameWorks.findAndCount({
			include: [
			{
				as: "projects",
				model: this.model.projects,
				include: [
					{
						as: "users",
						attributes,
						model: this.model.users,
					},
				]
			}, 
			],
			where: query,
		}).then(x => {
			x = x.toJSON();
			x.projects.user = x.projects.users;
		});
		//}).then(list => list.map(o => o.toJSON()));
		return this.success(list);
	}
}

module.exports = GameWorks;
