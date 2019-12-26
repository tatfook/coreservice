'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
        DROP procedure IF EXISTS \`p_enable_project\`;
      `);
        await queryInterface.sequelize.query(`
        CREATE PROCEDURE \`p_enable_project\`(In x_projectId bigint)
    MODIFIES SQL DATA
    COMMENT '解封项目'
begin
    
    replace into projects select * from illegalProjects where id = x_projectId;
    delete from illegalProjects where id = x_projectId;
	
    
    replace into favorites select * from illegalFavorites where id > 0 and (objectType = 5 and objectId = x_projectId);
    delete from illegalFavorites where id > 0 and (objectType = 5 and objectId = x_projectId);
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
