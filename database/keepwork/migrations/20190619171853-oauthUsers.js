
'use strict'

const tableName = "oauthUsers";
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
                "attribute": "externalId",
                "order": "ASC"
            },
            {
                "attribute": "type",
                "order": "ASC"
            }
        ],
        "unique": true,
        "name": "oauth_users_external_id_type"
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
				defaultValue:"0"
			},
				
			"externalId": {
				type: STRING(128),
				allowNull: false,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"externalUsername": {
				type: STRING(255),
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:""
			},
				
			"type": {
				type: INTEGER,
				allowNull: false,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"token": {
				type: STRING(255),
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:""
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
		