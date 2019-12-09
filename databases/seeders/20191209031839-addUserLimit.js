'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(
            `insert into userLimits (userId, world, createdAt, updatedAt) select id, 3, now(), now() from users;`,
            {
                type: Sequelize.QueryTypes.INSERT,
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('userLimits', {}, { truncate: true });
    },
};
