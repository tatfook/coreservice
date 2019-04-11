

const DataLoader = require('dataloader');
const _ = require("lodash");

const {
	ENTITY_TYPE_PACKAGE,
} = require("../../core/consts.js");

class LessonConnector {
	constructor(ctx) {
		this.ctx = ctx;
		this.app = ctx.app;
		this.model = ctx.app.model;
		this.lessonModel = ctx.app.lessonModel;

		this.tagLoader = new DataLoader(async ids => {
			return await ctx.model.systemTags.findAll({where:{id:{$in:ids}}}).then(list => list.map(o => o.toJSON()));
		});
	}
}

module.exports = LessonConnector;
