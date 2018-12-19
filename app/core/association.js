
module.exports = app => {
	const users = app.model.users;
	const accounts = app.model.accounts;
	const roles = app.model.roles;
	const illegals = app.model.illegals;

	users.hasOne(accounts, {
		//as: "Account",
		foreignKey: "userId",
		//uniqueKey: "userId",
	});

	accounts.belongsTo(users, {
		//as: "User",
		foreignKey: "userId",
		targetKey: "id",
	});

	users.hasMany(roles, {
		foreignKey: "userId",
		sourceKey: "id",
	});

	roles.belongsTo(users, {
		foreignKey: "userId",
		targetKey: "id",
	});

	users.hasOne(illegals, {
		foreignKey: "objectId"
	});

	illegals.belongsTo(users, {
		foreignKey: "objectId",
		targetKey: "id",
	});
}
