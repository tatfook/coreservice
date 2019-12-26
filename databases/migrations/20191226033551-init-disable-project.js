'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
        DROP procedure IF EXISTS \`p_disable_project\`;
      `);
        await queryInterface.sequelize.query(`
        CREATE  PROCEDURE \`p_disable_project\`(In x_projectId bigint)
            MODIFIES SQL DATA
            COMMENT '封停项目'
        begin

            replace into illegalProjects select * from projects where id = x_projectId;
            delete from projects where id = x_projectId;


            replace into illegalFavorites select * from favorites where id > 0 and (objectType = 5 and objectId = x_projectId);
            delete from favorites where id > 0 and (objectType = 5 and objectId = x_projectId); 
        end
`);
    },

    down: (queryInterface, Sequelize) => {
        /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    },
};
