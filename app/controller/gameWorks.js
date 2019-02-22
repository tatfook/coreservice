
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
						include: [
						{
							as: "userinfos",
							model: this.model.userinfos,
						},
						]
					},
				]
			}, 
			],
			where: query,
		}).then(x => {
			x.rows = _.map(x.rows, o => {
				o = o.toJSON();
				if (!o.projects) return o;
				o.projects.user = o.projects.users;
				return o;
			});
			return x;
		});
		//}).then(list => list.map(o => o.toJSON()));
		return this.success(list);
	}
}

module.exports = GameWorks;
