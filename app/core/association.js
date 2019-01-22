
module.exports = app => {
	const users = app.model.users;
	const accounts = app.model.accounts;
	const roles = app.model.roles;
	const illegals = app.model.illegals;

	users.hasOne(accounts, {
		as: "accounts",
		foreignKey: "userId",
		constraints: false,
	});

	accounts.belongsTo(users, {
		as: "users",
		foreignKey: "userId",
		targetKey: "id",
		constraints: false,
	});

	users.hasMany(roles, {
		as:"roles",
		foreignKey: "userId",
		sourceKey: "id",
		constraints: false,
	});

	roles.belongsTo(users, {
		as: "users",
		foreignKey: "userId",
		targetKey: "id",
		constraints: false,
	});

	app.model.users.hasMany(app.model.issues, {
		as:"issues",
		foreignKey: "userId",
		sourceKey: "id",
		constraints: false,
	});

	app.model.issues.belongsTo(app.model.users, {
		as: "users",
		foreignKey: "userId",
		targetKey: "id",
		constraints: false,
	});

	app.model.users.hasOne(illegals, {
		as: "illegals",
		foreignKey: "objectId",
		constraints: false,
	});

	illegals.belongsTo(users, {
		as: "users",
		foreignKey: "objectId",
		targetKey: "id",
		constraints: false,
	});

	app.model.projects.hasOne(illegals, {
		as: "illegals",
		foreignKey: "objectId",
		constraints: false,
	});

	illegals.belongsTo(app.model.projects, {
		as: "projects",
		foreignKey: "objectId",
		targetKey: "id",
		constraints: false,
	});

	app.model.sites.hasOne(illegals, {
		as: "illegals",
		foreignKey: "objectId",
		constraints: false,
	});

	illegals.belongsTo(app.model.sites, {
		as: "sites",
		foreignKey: "objectId",
		targetKey: "id",
		constraints: false,
	});

	illegals.belongsTo(app.model.illegalUsers, {
		as: "illegalUsers",
		foreignKey: "objectId",
		targetKey: "id",
		constraints: false,
	});

	app.model.illegalProjects.hasOne(illegals, {
		as: "illegals",
		foreignKey: "objectId",
		constraints: false,
	});

	illegals.belongsTo(app.model.illegalProjects, {
		as: "illegalProjects",
		foreignKey: "objectId",
		targetKey: "id",
		constraints: false,
	});

	app.model.illegalSites.hasOne(illegals, {
		as: "illegals",
		foreignKey: "objectId",
		constraints: false,
	});

	illegals.belongsTo(app.model.illegalSites, {
		as: "illegalSites",
		foreignKey: "objectId",
		targetKey: "id",
		constraints: false,
	});

	// 项目收藏
	app.model.projects.hasMany(app.model.favorites, {
		as: "favorites",
		foreignKey: "objectId",
		sourceKey: "id",
		constraints: false,
	});
	app.model.favorites.belongsTo(app.model.projects, {
		as: "projects",
		foreignKey: "objectId",
		targetKey: "id",
		constraints: false,
	});
	// 用户项目
	app.model.users.hasMany(app.model.projects, {
		as: "projects",
		foreignKey: "userId",
		sourceKey: "id",
		constraints: false,
	});
	app.model.projects.belongsTo(app.model.users, {
		as: "users",
		foreignKey:"userId",
		targetKey: "id",
		constraints: false,
	});

	// 探索APP
	app.model.paracraftDevices.hasMany(app.model.paracraftGameCoinKeys, {
		as: "paracraftGameCoinKeys",
		foreignKey: "deviceId",
		sourceKey: "deviceId",
		constraints: false,
	});

	app.model.paracraftGameCoinKeys.belongsTo(app.model.paracraftDevices, {
		as: "paracraftDevices",
		foreignKey:"deviceId",
		targetKey: "deviceId",
		constraints: false,
	});
}
