const _ = require("lodash");

module.exports = app => {
	//app.model.afterCreate((instance, options) => {
		//console.log(instance,_modelOptions);
		//instance = instance.get({plain:true});
		//console.log(instance, options);
		//console.log("--------");
	//});
	
	const models = {
		users:"users", 
		sites:"sites", 
		worlds: "worlds",
		packages:"packages", 
		projects:"projects",
		favorites: "favorites",
		issues: "issues",
		comments: "comments",
		illegals:"illegals",
		projectRates: "projectRates",
	};

	const map = {};

	async function getList(options) {
		const {model, where} = options;
		const tableName = model.getTableName();
		const modelName = models[tableName];

		if (!modelName) return [];

		const list = await app.model[modelName].findAll({where});

		_.each(list, (o, i) => list[i] = o.get ? o.get({plain:true}) : o);

		return list;
	}

	function hook(tableName, data, model,  oper) {
		if (model && model.__hook__) {
			return model.__hook__(data, oper);
		}
	}

	async function afterCreate(inst) {
		const cls = inst.constructor;
		const tableName = cls.getTableName();
		const modelName = models[tableName];
		if (!modelName) return;
		
		inst = inst.get({plain:true});
		const model = app.model[modelName];

		hook(tableName, inst, model, "create");

		const apiName = tableName + "Upsert";
		if (!app.api[apiName]) return ;
		await app.api[apiName](inst);
	}

	async function afterBulkUpdate(options) {
		const tableName = options.model.getTableName();
		const modelName = models[tableName];
		const list = await getList(options);

		const apiName = tableName + "Upsert";
		const model = app.model[modelName];

		if (!modelName) return;

		for (let i = 0; i < list.length; i++) {
			const data = list[i];

			hook(tableName, data, model, "update");

			if (app.api[apiName]) {
				await app.api[apiName](data);
			}
		}
	}

	async function beforeBulkDestroy(options) {
		const tableName = options.model.getTableName();
		const modelName = models[tableName];
		const key = JSON.stringify({tableName, where:options.where});
		const list = await getList(options);

		if (!modelName) return;

		map[key] = _.concat(map[key] || [], list);
	}

	async function afterBulkDestroy(options) {
		const tableName = options.model.getTableName();
		const modelName = models[tableName];
		const key = JSON.stringify({tableName, where:options.where});
		const list = map[key] || [];
		const apiName = tableName + "Destroy";

		if (!modelName) return;
		const model = app.model[modelName];

		map[key] = [];
	
		for (let i = 0; i < list.length; i++) {
			const data = list[i];

			hook(tableName, data, model, "destroy");

			if (app.api[apiName]) {
				await app.api[apiName](data);
			}
		}
	}

	app.model.afterCreate((inst) =>  afterCreate(inst));

	app.model.afterBulkUpdate((options) => afterBulkUpdate(options));

	app.model.beforeBulkDestroy((options) => beforeBulkDestroy(options));

	app.model.afterBulkDestroy(options => afterBulkDestroy(options));
}
