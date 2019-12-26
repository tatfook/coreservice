'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
        DROP procedure IF EXISTS \`p_disable_user\`;
      `);
        await queryInterface.sequelize.query(`
        CREATE  PROCEDURE \`p_disable_user\`(IN x_userId bigint)
    MODIFIES SQL DATA
    COMMENT '禁用用户'
begin
	
	replace into illegalUsers select * from users where id = x_userId;
    delete from users where id = x_userId;
    
    replace into illegalProjects select * from projects where userId = x_userId;
    delete from projects where id > 0 and userId = x_userId;
    
    replace into illegalSites select * from sites where userId = x_userId;
    delete from sites where id > 0 and userId = x_userId;
    
    replace into illegalComments select * from comments where userId = x_userId;
    delete from comments where id > 0 and userId = x_userId;
    
    replace into illegalIssues select * from issues where userId = x_userId;
    delete from issues where id > 0 and userId = x_userId;
    
    replace into illegalFavorites select * from favorites where userId = x_userId or (objectId = x_userId  and objectType = 0) or (objectType = 5 and objectId in (select id from projects where userId = x_userId));
    delete from favorites where id > 0 and (userId = x_userId or (objectId = x_userId  and objectType = 0) or (objectType = 5 and objectId in (select id from projects where userId = x_userId)));
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
