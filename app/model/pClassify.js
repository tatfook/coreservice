
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

	const model = app.model.define("pClassies", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		parentId: {
			type: BIGINT,
			defaultValue:0,
		},

		name: {                   // 分类名
			type: STRING,
			defaultValue:"",
		},

		extra: {
			type: JSON,
		}

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	app.model.pClassies = model;
	return model;
};

