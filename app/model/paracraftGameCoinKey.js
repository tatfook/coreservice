
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

	const model = app.model.define("paracraftGameCoinKeys", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		key: {                         // 激活码
			type: STRING,
			unique: true,
		},

		price: {                       // 价格
			type: INTEGER,
			defaultValue:0,
		},

		active: {                      // 是否激活
			type: INTEGER,
			defaultValue: false,
		},

		gameCoin: {                    // 游戏币数量
			type: INTEGER,
			defaultValue: 0,
		},

		deviceId: {                    // 激活设备ID
			type: STRING,
			defaultValue:"",
		},

		activeTime: {                  // 激活时间
			type: DATE,
		},

		purchase: {                    // 是否购买
			type: INTEGER,
			defaultValue: false,
		},

		purchaseName: {                // 购买者姓名
			type: STRING,
			defaultValue:"",
		},

		purchaseCellphone: {            // 购买者电话
			type: STRING(24),
			defaultValue:"",
		},
		
		purchaseTime: {                 // 购买时间
			type: DATE,
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

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	app.model.paracraftGameCoinKeys = model;
	return model;
};

