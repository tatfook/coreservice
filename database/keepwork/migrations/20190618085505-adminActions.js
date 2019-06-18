'use strict';

const tableName="adminActions";

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable(tableName, {
			id: {
				type: BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},
			
			userId: {                      // 操作者用户ID
				type: BIGINT,
				defaultValue: 0,
			},

			url: {                         // 请求的URL
				type: STRING(1024),
			},

			data: {                        // 请求的数据
				type: JSON,
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
