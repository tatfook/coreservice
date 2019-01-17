
const _ = require("lodash");

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
		DECIMAL,
	} = app.Sequelize;

	const model = app.model.define("systems", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});

	//app.model.accounts = model;
	return model;
};






