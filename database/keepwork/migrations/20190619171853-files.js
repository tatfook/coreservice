
'use strict'

const tableName = "files";
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
    },
    {
        "primary": false,
        "fields": [
            {
                "attribute": "key",
                "order": "ASC"
            }
        ],
        "unique": true,
        "name": "key"
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
				
			"key": {
				type: STRING(256),
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"userId": {
				type: BIGINT,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"siteId": {
				type: BIGINT,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"filename": {
				type: STRING(128),
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"checked": {
				type: INTEGER,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:"0"
			},
				
			"type": {
				type: STRING(12),
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"size": {
				type: BIGINT,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:"0"
			},
				
			"hash": {
				type: STRING(64),
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
		