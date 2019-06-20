
const { app, mock, assert  } = require('egg-mock/bootstrap');
const _ = require("lodash");
const loader = require("./setup/loader.js");

before(() => {
	loader(app);
});

afterEach(async () => {
	const keepworkTables = await app.model.query(`show tables`, {type: app.model.QueryTypes.SHOWTABLES}).then(list => _.filter(list, o => o != "SequelizeMeta"));
	const opts = {restartIdentity:true, cascade:true};
	const list = [];
	_.each(keepworkTables, tableName => list.push(app.model[tableName] && app.model[tableName].truncate(opts)));
	const lessonTables = await app.lessonModel.query(`show tables`, {type: app.lessonModel.QueryTypes.SHOWTABLES}).then(list => _.filter(list, o => o != "SequelizeMeta"));
	_.each(lessonTables, tableName => list.push(app.lessonModel[tableName] && app.lessonModel[tableName].truncate(opts)));
	await Promise.all(list);
});
