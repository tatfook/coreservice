'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(
            `update userLimits set world=100;`,
            {
                type: Sequelize.QueryTypes.UPDATE,
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(
            `update userLimits set world=3;`,
            {
                type: Sequelize.QueryTypes.UPDATE,
            }
        );
    },
};
