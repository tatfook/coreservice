'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.addIndex(
                'systemTagProjects',
                {
                    fields: [
                        {
                            attribute: 'systemTagId',
                            order: 'ASC'
                        },
                        {
                            attribute: 'projectId',
                            order: 'ASC'
                        }
                    ],
                    unique: true,
                    name: 'uk_systemTagId_projectId'
                },
                { transaction }
            );
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex(
            'systemTagProjects',
            'uk_systemTagId_projectId'
        );
    }
};
