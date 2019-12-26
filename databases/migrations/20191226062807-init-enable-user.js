'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
        DROP procedure IF EXISTS \`p_enable_user\`;
      `);
        await queryInterface.sequelize.query(`
        CREATE  PROCEDURE \`p_enable_user\`(IN x_userId bigint)
    MODIFIES SQL DATA
    COMMENT '解封用户'
begin
	
	replace into users select * from illegalUsers where id = x_userId;
    delete from illegalUsers where id = x_userId;
    
    replace into projects select * from illegalProjects where userId = x_userId;
    delete from illegalProjects where id > 0 and userId = x_userId;
    
    replace into sites select * from illegalSites where userId = x_userId;
    delete from illegalSites where id > 0 and userId = x_userId;
    
    replace into comments select * from illegalComments where userId = x_userId;
    delete from illegalComments where id > 0 and userId = x_userId;
    
    replace into issues select * from illegalIssues where userId = x_userId;
    delete from illegalIssues where id > 0 and userId = x_userId;
    
    replace into favorites select * from illegalFavorites where userId = x_userId or (objectId = x_userId  and objectType = 0) or (objectType = 5 and objectId in (select id from projects where userId = x_userId));
    delete from illegalFavorites where id > 0 and (userId = x_userId or (objectId = x_userId  and objectType = 0) or (objectType = 5 and objectId in (select id from projects where userId = x_userId)));
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
