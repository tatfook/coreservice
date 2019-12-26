'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
        DROP procedure IF EXISTS \`p_disable_site\`;
      `);
        await queryInterface.sequelize.query(`
        CREATE  PROCEDURE \`p_disable_site\`(In x_siteId bigint)
    MODIFIES SQL DATA
    COMMENT '封停网站'
begin
    
    replace into illegalSites select * from sites where id = x_siteId;
    delete from sites where id = x_siteId;
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
