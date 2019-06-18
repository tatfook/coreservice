
'use strict';

const tableName="projectRates";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable(tableName, {
			// 记录ID
			id: {
				type: BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},
			
			// 用户Id
			userId: {
				type: BIGINT,
				defaultValue: 0,
			},

			// 项目Id
			projectId: {
				type: BIGINT,
				defaultValue: 0,
			},

			// 分数 0-100 
			rate: {
				type: INTEGER,
				defaultValue: 0,
			},

			// 额外数据
			extra: {
				type: JSON,
				defaultValue: {},
			},

		}, {
			underscored: false,
			charset: "utf8mb4",
			collate: 'utf8mb4_bin',
		});

		return queryInterface.addIndex(tableName, ['userId', 'projectId'], {unique:true});
	},
	
	down: (queryInterface, Sequelize) => {
	    return queryInterface.dropTable(tableName);
	}
};
