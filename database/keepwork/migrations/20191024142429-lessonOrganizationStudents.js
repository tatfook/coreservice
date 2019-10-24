
'use strict'

const tableName = "lessonOrganizationStudents";
const indexes = [];

module.exports = {
	up: async(queryInterface, Sequelize) => {
		const {
			BIGINT,
			STRING,
			TEXT,
			BOOLEAN,
			INTEGER,
			DECIMAL,
			FLOAT,
			DOUBLE,
			REAL,
			DATE,
			JSON,
		} = Sequelize;
		await queryInterface.createTable(tableName, {
			
			"id": {
				type: BIGINT,
				allowNull: false,
				primaryKey: false,
				autoIncrement: true,
				defaultValue:"0"
			},
				
			"organizationId": {
				type: BIGINT,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:"0"
			},
				
			"classId": {
				type: BIGINT,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:"0"
			},
				
			"memberId": {
				type: BIGINT,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:"0"
			},
				
			"realname": {
				type: STRING(255),
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"roleId": {
				type: INTEGER,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:"0"
			},
				
			"privilege": {
				type: INTEGER,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:"0"
			},
				
			"extra": {
				type: JSON,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"createdAt": {
				type: DATE,
				allowNull: false,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"updatedAt": {
				type: DATE,
				allowNull: false,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"bind": {
				type: INTEGER,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:"0"
			},
				
		}, {
			underscored: false,
			charset: "utf8mb4",
			collate: 'utf8mb4_bin',
		});

		for (let i = 0; i < indexes.length; i++) {
			const index = indexes[i];
			if (index.primary) continue;
			await queryInterface.addIndex(tableName, index);
		}
		
		return ;
	},

	down: async(queryInterface, Sequelize) => {
		return queryInterface.dropTable(tableName);
	}
};
		