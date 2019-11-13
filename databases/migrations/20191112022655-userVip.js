'use strict';
/**
 * 用户添加vip和tLevel字段对应issue5453
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await Promise.all([
                queryInterface.addColumn(
                    'users',
                    'vip',
                    {
                        type: Sequelize.INTEGER(2),
                        defaultValue: 0,
                        comments: '是否是VIP，0否，1是',
                    },
                    { transaction }
                ),
                queryInterface.addColumn(
                    'users',
                    'tLevel',
                    {
                        type: Sequelize.INTEGER(2),
                        defaultValue: 0,
                        comments: '教师级别,0表示T0,1表示T1,依次类推',
                    },
                    { transaction }
                ),
                queryInterface.addColumn(
                    'illegalUsers',
                    'vip',
                    {
                        type: Sequelize.INTEGER(2),
                        defaultValue: 0,
                        comments: '是否是VIP，0否，1是',
                    },
                    { transaction }
                ),
                queryInterface.addColumn(
                    'illegalUsers',
                    'tLevel',
                    {
                        type: Sequelize.INTEGER(2),
                        defaultValue: 0,
                        comments: '教师级别,0表示T0,1表示T1,依次类推',
                    },
                    { transaction }
                ),
            ]);
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await Promise.all([
                queryInterface.removeColumn('users', 'vip', {
                    transaction,
                }),
                queryInterface.removeColumn('users', 'tLevel', {
                    transaction,
                }),
                queryInterface.removeColumn('illegalUsers', 'vip', {
                    transaction,
                }),
                queryInterface.removeColumn('illegalUsers', 'tLevel', {
                    transaction,
                }),
            ]);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
