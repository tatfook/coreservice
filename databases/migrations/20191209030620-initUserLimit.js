'use strict';
const tableName = 'userLimits';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.createTable(
            tableName,
            {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                userId: {
                    type: Sequelize.BIGINT,
                    allowNull: false,
                    comment: '用户id',
                    unique: true,
                },
                world: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    comment: '世界的数量上限',
                    defaultValue: '0',
                },
                createdAt: {
                    type: Sequelize.DATE,
                },
                updatedAt: {
                    type: Sequelize.DATE,
                },
            },
            {
                underscored: false,
                charset: 'utf8mb4',
                collate: 'utf8mb4_bin',
                comment: '用户限制表',
            }
        );
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable(tableName);
    },
};
