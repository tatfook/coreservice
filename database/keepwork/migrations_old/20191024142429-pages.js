
'use strict'

const tableName = "pages";
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
                "attribute": "url",
                "order": "ASC"
            }
        ],
        "unique": true,
        "name": "url"
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
				
			"siteId": {
				type: BIGINT,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"url": {
				type: STRING(128),
				allowNull: false,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"folder": {
				type: STRING(128),
				allowNull: false,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"hash": {
				type: STRING(64),
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"content": {
				type: TEXT('long'),
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"keywords": {
				type: STRING(255),
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"title": {
				type: STRING(128),
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"description": {
				type: STRING(512),
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
		