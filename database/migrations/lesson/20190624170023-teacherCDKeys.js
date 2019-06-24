
'use strict'

const tableName = "teacherCDKeys";
const indexes = [
    {
        "primary": true,
        "fields": [
            {
                "attribute": "id",
                "order": "ASC"
            }
        ],
        "unique": true,
        "name": "PRIMARY"
    }
];

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
				primaryKey: true,
				autoIncrement: true,
				
			},
				
			"userId": {
				type: BIGINT,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"key": {
				type: STRING(64),
				allowNull: false,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"state": {
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
				
			"expire": {
				type: BIGINT,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:"31536000000"
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
		