'use strict';

const tableName = 'worlds';
const indexes = [
    {
        primary: true,
        fields: [
            {
                attribute: 'id',
                order: 'ASC',
            },
        ],
        unique: true,
        name: 'PRIMARY',
    },
    {
        primary: false,
        fields: [
            {
                attribute: 'userId',
                order: 'ASC',
            },
            {
                attribute: 'worldName',
                order: 'ASC',
            },
        ],
        unique: true,
        name: 'worlds_user_id_world_name',
    },
    {
        primary: false,
        fields: [
            {
                attribute: 'projectId',
                order: 'ASC',
            },
        ],
        unique: true,
        name: 'worlds_project_id',
    },
];

module.exports = {
    up: async (queryInterface, Sequelize) => {
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
        await queryInterface.createTable(
            tableName,
            {
                id: {
                    type: BIGINT,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                },

                userId: {
                    type: BIGINT,
                    allowNull: false,
                    primaryKey: false,
                    autoIncrement: false,
                },

                worldName: {
                    type: STRING(128),
                    allowNull: false,
                    primaryKey: false,
                    autoIncrement: false,
                },

                revision: {
                    type: STRING(32),
                    allowNull: false,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '0',
                },

                projectId: {
                    type: BIGINT,
                    allowNull: false,
                    primaryKey: false,
                    autoIncrement: false,
                },

                commitId: {
                    type: STRING(64),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: 'master',
                },

                archiveUrl: {
                    type: STRING(255),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '',
                },

                fileSize: {
                    type: BIGINT,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '0',
                },

                giturl: {
                    type: STRING(256),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                download: {
                    type: STRING(256),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                extra: {
                    type: JSON,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                createdAt: {
                    type: DATE,
                    allowNull: false,
                    primaryKey: false,
                    autoIncrement: false,
                },

                updatedAt: {
                    type: DATE,
                    allowNull: false,
                    primaryKey: false,
                    autoIncrement: false,
                },
            },
            {
                underscored: false,
                charset: 'utf8mb4',
                collate: 'utf8mb4_bin',
            }
        );

        for (let i = 0; i < indexes.length; i++) {
            const index = indexes[i];
            if (index.primary) continue;
            await queryInterface.addIndex(tableName, index);
        }

        return;
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.dropTable(tableName);
    },
};
