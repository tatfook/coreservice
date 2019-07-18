
/* 用户名前缀表, 用于机构批量生成用户 */

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

	const model = app.model.define("userPrefixs", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		prefix: {                       // 用户名前缀
			type: STRING,
			unique: true,
			defaultValue:"",
			allowNull: false,
		},

		no: {                          // 自增起始序号
			type: INTEGER,
			defaultValue: 0,   
		},

		organId: {                     // 机构ID
			type: BIGINT,
			defaultValue: 0,
		},

		classId: {
			type: BIGINT,              // 班级ID
			defaultValue: 0,
		},

		handlerId: {                   // 操作人用户ID
			type: BIGINT,
			defaultValue: 0,
		},

		cellphone: {                   // 关联的手机号
			type: STRING(24),
			defaultValue: "",
			allowNull: false,
		},

		extra: {                       // 附加数据
			type: JSON,
			defaultValue:{},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});
	
	app.model.userPrefixs = model;

	return model;
};


































