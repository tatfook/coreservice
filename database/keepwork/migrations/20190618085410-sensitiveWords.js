'use strict';

const tableName="sensitiveWords";

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable(tableName, {
			id: {
				type: BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},
			
			word: {
				type:STRING,
				//unique: true,
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
	},
	
	down: (queryInterface, Sequelize) => {
	    return queryInterface.dropTable(tableName);
	}
};
