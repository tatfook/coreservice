
module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
		DATE,
	} = app.Sequelize;

	const model = app.model.define("paracraftVisitors", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		realname: {                    // 姓名
			type:STRING(64),
			defaultValue:"",
		},

		cellphone: {                   // 电话
			type:STRING(24),
			defaultValue:"",
			unique: true,
		},

		email: {                       // 邮箱
			type: STRING,
		},

		organization: {                // 组织 机构
			type: STRING,
			defaultValue:"",
		},

		description: {                 // 描述
			type: STRING,
			defaultValue:"",
		},

		extra: {
			type: JSON,
			defaultValue: {},
		}

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});
	
	app.model.paracraftVisitors = model;

	return model;
};

