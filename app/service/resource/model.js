
const _ = require("lodash");
const DataLoader = require('dataloader');

class Model {
	constructor(app) {
		this.app = app;

		this.promises = [];

		this.projectLoader = new DataLoader(async (ids) => {
			const list = await app.model.projects.findAll({where:{id:{$in: ids}}}).then(list => list.map(o => o.toJSON()));
			return _.map(ids, id => _.find(list, o => o.id == id));
		});
	}

}

module.exports = Model;
