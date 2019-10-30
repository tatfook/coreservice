'use strict';

const tableName = 'users';
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
                attribute: 'username',
                order: 'ASC',
            },
        ],
        unique: true,
        name: 'username',
    },
    {
        primary: false,
        fields: [
            {
                attribute: 'email',
                order: 'ASC',
            },
        ],
        unique: true,
        name: 'email',
    },
    {
        primary: false,
        fields: [
            {
                attribute: 'cellphone',
                order: 'ASC',
            },
        ],
        unique: true,
        name: 'cellphone',
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

                username: {
                    type: STRING(48),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                password: {
                    type: STRING(48),
                    allowNull: false,
                    primaryKey: false,
                    autoIncrement: false,
                },

                roleId: {
                    type: INTEGER,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '0',
                },

                email: {
                    type: STRING(24),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                cellphone: {
                    type: STRING(24),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                nickname: {
                    type: STRING(48),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                portrait: {
                    type: STRING(1024),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                sex: {
                    type: STRING(4),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                description: {
                    type: STRING(128),
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

                realname: {
                    type: STRING(24),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                channel: {
                    type: INTEGER,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '0',
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
