'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      STRING,
      DATE,
    } = Sequelize;
    return queryInterface.createTable('domains', {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      domain: {
        type: STRING(32),
        unique: true,
        allowNull: false,
      },

      userId: {
        type: BIGINT,
        allowNull: false,
      },

      siteId: {
        type: BIGINT,
        allowNull: false,
      },

      createdAt: {
        type: DATE,
        allowNull: false,
      },

      updatedAt: {
        type: DATE,
        allowNull: false,
      },

    }, {
      underscored: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_bin',
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('domains');
  },
};
