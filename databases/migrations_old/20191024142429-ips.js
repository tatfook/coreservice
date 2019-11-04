'use strict';

const tableName = 'ips';
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

                type: {
                    type: STRING(16),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: 'ipv4',
                },

                start: {
                    type: BIGINT,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '0',
                },

                end: {
                    type: BIGINT,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '0',
                },

                cc: {
                    type: STRING(8),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: 'CN',
                },

                ip: {
                    type: STRING(24),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '',
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
