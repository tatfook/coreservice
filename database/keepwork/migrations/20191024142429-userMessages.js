
'use strict'

const tableName = "userMessages";
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
                "attribute": "userId",
                "order": "ASC"
            },
            {
                "attribute": "messageId",
                "order": "ASC"
            }
        ],
        "unique": true,
        "name": "user_messages_user_id_message_id"
    },
    {
        "primary": false,
        "fields": [
            {
                "attribute": "messageId",
                "order": "ASC"
            }
        ],
        "unique": false,
        "name": "messageId"
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
				
			"messageId": {
				type: BIGINT,
				allowNull: true,
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
		