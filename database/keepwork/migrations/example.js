'use strict';

const tableName="examples";
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable(tableName, {

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
