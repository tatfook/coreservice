
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
				o.projects = o.projects || (o.extra || {}).projects;
				if (!o.projects) return o;
				o.projects.user = o.projects.users;
				return o;
			});
			return x;
		});
		//}).then(list => list.map(o => o.toJSON()));
		return this.success(list);
	}

	async snapshoot() {
		const {ids=[]} = this.validate();
		if (ids.length == 0) return this.success("OK");

		const attributes = ["id", "username", "nickname", "portrait"];
		const list = await this.model.gameWorks.findAll({
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
			where: {
				id: {$in: ids},
			},
		}).then(list => list.map(o => o.toJSON()));

		for (let i = 0; i < list.length; i++) {
			const o = list[i];
			if (o.projects) o.projects.user = o.projects.users;
			const extra = {...o.extra, projects: o.projects};
			await this.model.gameWorks.update({extra}, {where:{id: o.id}});
		}

		return this.success("OK");
	}
}

module.exports = GameWorks;
