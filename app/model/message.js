const _ = require("lodash");

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
		DECIMAL,
	} = app.Sequelize;

	const model = app.model.define("messages", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		sender: {                 // 消息发送者
			type: BIGINT,
		},
		
		type: {                   // 消息类型 0 - 系统消息
			type: INTEGER,
			defaultValue: 0
		},

		all: {                    // 0 - 非全部  1 - 全部
			type: INTEGER,
			defaultValue: 0,
		},

		msg: {
			type: JSON,
			defaultValue:{},
		},

		//recvIds: {
			//type: 
		//}

		extra: {
			type: JSON,
			defaultValue:{},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});

	//model.afterCreate((instance, options) => {
		//const inst = instance.toJSON ? instance.toJSON() : instance;
		//const datas = _.map(inst.receiver.recvIds || [], id => ({
			//userId: id,
			//messageId: inst.id,
			//state: 0,
		//}));
		//app.model.userMessages.bulkCreate(datas);
	//});

	// 主动合并消息
	model.mergeMessage = async function(userId) {
		const user = await app.model.users.findOne({where:{id:userId}}).then(o => o && o.toJSON());
		if (!user) return;
		const sql = `select id, createdAt from messages where \`all\` = :all and createdAt > :createdAt and id not in (select messageId from userMessages where userId = :userId)`;
		const list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				all: 1,
				userId,
				createdAt: user.createdAt,
			}
		});
		const datas = _.map(list, o => ({userId, messageId:o.id, state:0, createdAt: o.createdAt}));
		await app.model.userMessages.bulkCreate(datas);
		return;
	}

	model.getCountByUserId = async function(userId) {
		await this.mergeMessage();
	}

	app.model.messages = model;

	return model;
};






