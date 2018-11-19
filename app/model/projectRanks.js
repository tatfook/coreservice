
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

	const model = app.model.define("projectRanks", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {
			type: BIGINT,
			allowNull: false,
		},

		projectId: {
			type: BIGINT,
			unique: true,
			allowNull: false,
		},

		comment: {
			type: INTEGER,
			defaultValue: 0,
		},

		visit: {
			type: INTEGER,
			defaultValue:0,
		},

		star: {
			type: INTEGER,
			defaultValue: 0,
		},

		favorite: {
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

	app.model.projectRanks = model;

	return model;
};

