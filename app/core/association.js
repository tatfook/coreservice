
module.exports = app => {
	const users = app.model.users;
	const accounts = app.model.accounts;
	const roles = app.model.roles;
	const illegals = app.model.illegals;

	users.hasOne(accounts, {
		//as: "Account",
		foreignKey: "userId",
		constraints: false,
	});

	accounts.belongsTo(users, {
		//as: "User",
		foreignKey: "userId",
		targetKey: "id",
		constraints: false,
	});

	users.hasMany(roles, {
		foreignKey: "userId",
		sourceKey: "id",
		constraints: false,
	});

	roles.belongsTo(users, {
		foreignKey: "userId",
		targetKey: "id",
		constraints: false,
	});

	users.hasOne(illegals, {
		foreignKey: "objectId",
		constraints: false,
	});

	illegals.belongsTo(users, {
		foreignKey: "objectId",
		targetKey: "id",
		constraints: false,
	});

	app.model.illegalUsers.hasOne(illegals, {
		as: "illegalUsers",
		foreignKey: "objectId",
		constraints: false,
	});

	app.model.projects.hasOne(illegals, {
		as: "projects",
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
		as: "sites",
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
		as: "illegalProjects",
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
		as: "illegalSites",
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
