'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            let pBlockIds = await queryInterface.sequelize.query(
                `SELECT id FROM pBlocks;`,
                { type: Sequelize.QueryTypes.SELECT, transaction }
            );
            const createArray = pBlockIds.map(item => {
                return {
                    pBlockId: item.id,
                    commonUser: 2,
                    vip: 2,
                    t1: 2,
                    t2: 2,
                    t3: 2,
                    t4: 2,
                    t5: 2,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            });
            await queryInterface.bulkInsert('pBlockAccesses', createArray, {
                transaction,
            });
            let pClassifyIds = await queryInterface.sequelize.query(
                `SELECT id FROM pClassifies;`,
                { type: Sequelize.QueryTypes.SELECT, transaction }
            );
            const createArrayForClassify = pClassifyIds.map(item => {
                return {
                    pClassifyId: item.id,
                    commonUser: 1,
                    vip: 1,
                    t1: 1,
                    t2: 1,
                    t3: 1,
                    t4: 1,
                    t5: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            });
            await queryInterface.bulkInsert(
                'pClassifyAccesses',
                createArrayForClassify,
                {
                    transaction,
                }
            );
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.bulkDelete(
                'pBlockAccesses',
                {},
                { truncate: true, transaction }
            );
            await queryInterface.bulkDelete(
                'pClassifyAccesses',
                {},
                { truncate: true, transaction }
            );
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
