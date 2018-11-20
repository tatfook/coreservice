
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
	
	model.getByUserId = async function(userId) {
		let rank = await app.model.projectRanks.findOne({where:{userId}});
		if (!rank) rank = await app.model.projectRanks.create({userId});

		return rank && rank.get({plain:true});
	}

	app.model.userRanks = model;

	return model;
};

