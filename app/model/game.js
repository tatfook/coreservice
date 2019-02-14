
const _ = require("lodash");

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		DATE,
		JSON,
	} = app.Sequelize;

	const attrs = {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		type: {
			type: INTEGER,    // 0 -- NPL 大赛
			defaultValue: 0,
		},

		name: {
			type: STRING(48), // 大赛名称
		},

		startDate: {
			type: STRING(24), // 开始日期
		},

		endDate: {            // 结束日期
			type: DATE,
		},

		state: {              // 0 -- 未开始  1 -- 进行中  2 -- 已结束
			type: INTEGER,
			defaultValue: 0,
		},

		extra: {
			type: JSON,
			defaultValue: {},
		},
	};

	const opts = {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	}

	const model = app.model.define("games", attrs, opts);

	//model.sync({force:true});

	app.model.games = model;

	return model;
};


































