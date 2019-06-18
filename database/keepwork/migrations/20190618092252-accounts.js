'use strict';

const tableName="accounts";

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable(tableName, {
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

			rmb: {                       // 人民币
				type: DECIMAL(10,2),
				defaultValue: 0,
			},

			coin: {                      // 知识币
				type: INTEGER,
				defaultValue: 0,
			},

			bean: {                      // 知识豆
				type: INTEGER,
				defaultValue: 0,
			},

			lockCoin: {                  // 待解锁的知识币
				type: INTEGER,
				defaultValue: 0,
			},

		}, {
			underscored: false,
			charset: "utf8mb4",
			collate: 'utf8mb4_bin',
		});
	},
	
	down: (queryInterface, Sequelize) => {
	    return queryInterface.dropTable(tableName);
	}
};
