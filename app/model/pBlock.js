
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

	const model = app.model.define("pBlocks", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		userId: {                     // 用户ID
			type: BIGINT,
			defaultValue:0,
		},

		name: {                       // 元件名称
			type: STRING,
			defaultValue:"",
		},

		url: {                        // 下载路径
			type: STRING(1024),
			defaultValue:"",
		},

		filetype: {                   // 文件类型
			type: STRING,
			defaultValue:"",
		},

		contributor: {                // 贡献者
			type: STRING,
			defaultValue:"",
		},

		useCount: {                   // 使用次数
			type: BIGINT,
			defaultValue:0,
		},

		extra: {
			type: JSON,
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	app.model.pBlocks = model;
	return model;
};

