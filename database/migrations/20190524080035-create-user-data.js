'use strict';

const tableName = 'userdatas';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      JSON,
      DATE,
    } = Sequelize;

    return queryInterface.createTable(tableName, {
      userId: {
        type: BIGINT,
        primaryKey: true,
      },

      data: {
        type: JSON,
        defaultValue: {},
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
    return queryInterface.dropTable(tableName);
  },
};
