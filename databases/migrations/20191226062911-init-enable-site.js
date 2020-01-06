'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
        DROP procedure IF EXISTS \`p_enable_site\`;
      `);
        await queryInterface.sequelize.query(`
        CREATE  PROCEDURE \`p_enable_site\`(In x_siteId bigint)
    MODIFIES SQL DATA
    COMMENT '解封网站'
begin
    
    replace into sites select * from illegalSites where id = x_siteId;
    delete from illegalSites where id = x_siteId;
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
