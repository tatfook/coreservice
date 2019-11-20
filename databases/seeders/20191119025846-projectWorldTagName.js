'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            let worlds = await queryInterface.sequelize.query(
                `SELECT 
      a.extra AS extraA, b.id AS worldId, b.extra AS extraB
  FROM
      projects a,
      worlds b
  WHERE
      a.id = b.projectId
          AND ISNULL(a.extra) = 0
          AND LENGTH(TRIM(JSON_EXTRACT(a.extra, '$.worldTagName'))) != 0;`,
                { type: Sequelize.QueryTypes.SELECT, transaction }
            );
            const promises = worlds.map(world => {
                const worldTagName = world.extraA.worldTagName;
                const extra = world.extraB;
                extra.worldTagName = worldTagName;
                return queryInterface.sequelize.query(
                    `update worlds set extra = :extra where id =:id`,
                    {
                        type: Sequelize.QueryTypes.UPDATE,
                        transaction,
                        replacements: {
                            extra: JSON.stringify(extra),
                            id: world.worldId,
                        },
                    }
                );
            });
            const result = await Promise.all(promises);
            console.log(result);
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    down: (queryInterface, Sequelize) => {},
};
