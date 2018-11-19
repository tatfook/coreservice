
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

	const model = app.model.define("userRanks", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {
			type: BIGINT,
			unique: true,
			allowNull: false,
		},

		project: {
			type: INTEGER,
			defaultValue: 0,
		},

		follow: {
			type: INTEGER,
			defaultValue: 0,
		},

		fans: {
			type: INTEGER,
			defaultValue: 0,
		},

		active: {
			type: INTEGER,
			defaultValue: 0,
		},

		extra: {
			type: JSON,
			defaultValue: {},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});

	app.model.userRanks = model;

	return model;
};

