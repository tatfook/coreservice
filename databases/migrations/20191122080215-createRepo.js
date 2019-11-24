'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const { BIGINT, BOOLEAN, DATE, STRING } = Sequelize;
        await queryInterface.createTable(
            'repos',
            {
                id: {
                    type: BIGINT,
                    primaryKey: true,
                    autoIncrement: true,
                },
                resourceId: {
                    type: BIGINT,
                    allowNull: false,
                    comments: 'repo的宿主id，绑定对应的site或者world',
                },
                resourceType: {
                    type: STRING(16),
                    allowNull: false,
                    comments: 'repo类型，目前指的是site和world',
                },
                username: {
                    type: STRING(120),
                    allowNull: false,
                },
                repoName: {
                    type: STRING(128),
                    allowNull: false,
                },
                path: {
                    type: STRING(256), // 旧数据中有些项目名字又臭又长
                    allowNull: false,
                },
                synced: {
                    type: BOOLEAN,
                    defaultValue: false,
                },
                createdAt: {
                    type: DATE,
                },
                updatedAt: {
                    type: DATE,
                },
            },
            {
                underscored: false,
                charset: 'utf8mb4',
                collate: 'utf8mb4_bin',
            }
        );

        await queryInterface.addIndex('repos', {
            fields: ['resourceType', 'resourceId'],
            name: 'indexOfResource'
        });
        await queryInterface.addIndex('repos', {
            fields: ['username', 'repoName'],
            name: 'indexOfName',
            unique: true,
        });
        await queryInterface.addIndex('repos', {
            fields: ['path'],
            name: 'indexOfPath',
            unique: true,
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('repos');
    },
};
