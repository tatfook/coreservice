
'use strict'

const tableName = "paracraftGameCoinKeys";
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
				type: STRING(255),
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"price": {
				type: INTEGER,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:"0"
			},
				
			"active": {
				type: INTEGER,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:"0"
			},
				
			"activeTime": {
				type: DATE,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"gameCoin": {
				type: INTEGER,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:"0"
			},
				
			"deviceId": {
				type: STRING(255),
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:""
			},
				
			"identity": {
				type: INTEGER,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:"0"
			},
				
			"purchase": {
				type: INTEGER,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:"0"
			},
				
			"purchaseName": {
				type: STRING(255),
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:""
			},
				
			"purchaseCellphone": {
				type: STRING(24),
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:""
			},
				
			"purchaseTime": {
				type: DATE,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"description": {
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
		