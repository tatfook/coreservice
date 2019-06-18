
'use strict';

const tableName="userdatas";
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable(tableName, {
			userId: {
				type: BIGINT,
				primaryKey: true,
			},

			data: {
				type: JSON,
				defaultValue: {},
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
