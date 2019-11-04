'use strict';

const tableName = 'lessonOrganizationForms';
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
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '0',
                },

                organizationId: {
                    type: BIGINT,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '0',
                },

                state: {
                    type: INTEGER,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '0',
                },

                type: {
                    type: INTEGER,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '0',
                },

                name: {
                    type: STRING(255),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '',
                },

                title: {
                    type: STRING(255),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '',
                },

                description: {
                    type: STRING(1024),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '',
                },

                text: {
                    type: TEXT,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                quizzes: {
                    type: JSON,
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
