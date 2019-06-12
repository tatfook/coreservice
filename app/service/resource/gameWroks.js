
const _ = require("lodash");
const DataLoader = require('dataloader');
const Model = require("./model.js");

class GameWorks extends Model {
	constructor(app) {
		super(app);

		this.associates = [
		{
		
		}
		]

	}

	set projectId(projectId) {
		this.__projectId__ = projectId;
		
		const promise = new Promise(async (resolve, reject) => {
			const project = await this.projectLoader.load(projectId);
			this.userId = this.userId || project.userId;
		});

		this.promises.push(promise);
	}

	get projectId() {
		return this.__projectId__;
	}

	async build(data) {
		if (data.projectId) {
			const project = await this.projectLoader.load(data.projectId);
			data.userId = project.userId;
		}

		return data;
	}
}

module.exports = GameWorks;
