
const _ = require("lodash");

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		FLOAT,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
		DECIMAL,
	} = app.Sequelize;

	const model = app.model.define("systems", {
		// 记录ID
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		// 项目数量
		project: {
			type: BIGINT,
			defaultValue: 0,
		},

		// 用户数量
		user: {
			type: BIGINT,
			defaultValue: 0,
		},

		// 项目平均分
		projectAvgRate: {
			type: FLOAT,
			defaultValue: 0,
		},

		// 用户平均分
		userAvgRate: {
			type: FLOAT,
			defaultValue: 0,
		},

		// 额外数据
		extra: {
			type: JSON,
			defaultValue: {},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});

	app.model.systems = model;
	return model;
};






