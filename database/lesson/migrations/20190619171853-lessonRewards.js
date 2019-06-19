
'use strict'

const tableName = "lessonRewards";
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
                "attribute": "packageId",
                "order": "ASC"
            },
            {
                "attribute": "lessonId",
                "order": "ASC"
            }
        ],
        "unique": true,
        "name": "lesson_rewards_user_id_package_id_lesson_id"
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
				allowNull: false,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"packageId": {
				type: BIGINT,
				allowNull: false,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"lessonId": {
				type: BIGINT,
				allowNull: false,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"coin": {
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
				
			"bean": {
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
		