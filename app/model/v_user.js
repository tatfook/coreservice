
const _ = require("lodash");

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const attrs = {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		username: {
			type: STRING(48),
			unique: true,
			allowNull: false,
		},

		nickname: {    // 昵称
			type: STRING(48),
		},

		name: {
			type: STRING(48),
		},

		school: {
			type: STRING(48),
		},

	};

	const opts = {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
		timestamps: false,
	}

	const model = app.model.define("v_users", attrs, opts);

	app.model.v_users = model;
	return model;
};


































