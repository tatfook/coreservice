'use strict';
const tableName = 'pClassifyAccesses';
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
                pClassifyId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    comment: '',
                    unique: true,
                },
                commonUser: {
                    type: Sequelize.INTEGER(2),
                    allowNull: true,
                    defaultValue: '0',
                    comment: '普通用户或者游客的权限，0表示不可见，1表示可见',
                },
                vip: {
                    type: Sequelize.INTEGER(2),
                    allowNull: true,
                    defaultValue: '0',
                    comment: 'vip用户，0表示不可见，1表示可见',
                },
                t1: {
                    type: Sequelize.INTEGER(2),
                    allowNull: true,
                    defaultValue: '0',
                    comment: 't1用户，0表示不可见，1表示可见',
                },
                t2: {
                    type: Sequelize.INTEGER(2),
                    allowNull: true,
                    defaultValue: '0',
                    comment: 't2用户，0表示不可见，1表示可见',
                },
                t3: {
                    type: Sequelize.INTEGER(2),
                    allowNull: true,
                    defaultValue: '0',
                    comment: 't3用户，0表示不可见，1表示可见',
                },
                t4: {
                    type: Sequelize.INTEGER(2),
                    allowNull: true,
                    defaultValue: '0',
                    comment: 't4用户，0表示不可见，1表示可见',
                },
                t5: {
                    type: Sequelize.INTEGER(2),
                    allowNull: true,
                    defaultValue: '0',
                    comment: 't5用户，0表示不可见，1表示可见',
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
                comment: '元件库分类的权限',
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
