'use strict';
const tableName = 'systemTagProjects';
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
                systemTagId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    comment: 'systemtag的主键Id',
                },
                projectId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    comment: 'project的主键Id',
                },
                sn: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: '0',
                    comment: '项目在此标签下的顺序，顺序越大，显示越靠前',
                },
                extra: {
                    type: Sequelize.JSON,
                    allowNull: true,
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
                comment: 'systemTag和project的关联关系表',
            }
        );
    },

    down: (queryInterface, Sequelize) => {
        /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
        return queryInterface.dropTable(tableName);
    },
};
