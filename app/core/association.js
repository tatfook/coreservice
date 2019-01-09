
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

	app.model.users.hasOne(illegals, {
		as: "illegals",
		foreignKey: "objectId",
		constraints: false,
	});

	illegals.belongsTo(users, {
		as: "illegals",
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
}
