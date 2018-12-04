
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

	const model = app.model.define("profiles", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 评论者
			type: BIGINT,
			allowNull: false,
			unique: true,
		},

		extend: {                   // 后端使用
			type: JSON,
			defaultValue: {},
		},

		extra: {                     // 前端使用
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
	
	model.associate = function() {
		app.model.profiles.belongsTo(app.model.users);
	}

	model.set = async function(userId, data = {}) {
		return await app.model.datas.update({data}, {where:{userId}});
	}

	model.get = async function(userId) {
		const data = await app.model.datas.findOne({where:{userId}});

		return data ? data.get({plain:true}).data : {};
	}

	app.model.profiles = model;
	return model;
};
