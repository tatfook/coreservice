'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const { STRING } = Sequelize;
        await queryInterface.changeColumn('repos', 'username', {
            type: STRING(48),
        });
        await queryInterface.changeColumn('repos', 'path', {
            type: STRING(180),
        });
        await queryInterface.changeColumn('sites', 'username', {
            type: STRING(48),
        });
        await queryInterface.changeColumn('sites', 'sitename', {
            type: STRING(128),
        });
    },

    down: async (queryInterface, Sequelize) => {
        const { STRING } = Sequelize;
        await queryInterface.changeColumn('repos', 'username', {
            type: STRING(120),
        });
        await queryInterface.changeColumn('repos', 'path', {
            type: STRING(256),
        });
        await queryInterface.changeColumn('sites', 'username', {
            type: STRING(64),
        });
        await queryInterface.changeColumn('sites', 'sitename', {
            type: STRING(256),
        });
    },
};
