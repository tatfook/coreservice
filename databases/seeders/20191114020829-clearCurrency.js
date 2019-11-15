'use strict';
/**
 * issue5462 清空知识币知识豆
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            let result = await queryInterface.sequelize.query(
                'update accounts set coin=0,bean=0,lockCoin=0;',
                { type: Sequelize.QueryTypes.UPDATE, transaction }
            );
            console.log(result);
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    down: (queryInterface, Sequelize) => {
        /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    },
};
