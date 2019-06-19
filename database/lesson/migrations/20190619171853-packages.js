
'use strict'

const tableName = "packages";
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
                "attribute": "packageName",
                "order": "ASC"
            }
        ],
        "unique": true,
        "name": "packageName"
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
				
			"packageName": {
				type: STRING(255),
				allowNull: false,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"subjectId": {
				type: BIGINT,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"minAge": {
				type: INTEGER,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:"0"
			},
				
			"maxAge": {
				type: INTEGER,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:"1000"
			},
				
			"state": {
				type: INTEGER,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:"0"
			},
				
			"intro": {
				type: STRING(512),
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"rmb": {
				type: INTEGER,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				defaultValue:"0"
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
				
			"auditAt": {
				type: DATE,
				allowNull: true,
				primaryKey: false,
				autoIncrement: false,
				
			},
				
			"lastClassroomCount": {
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
		