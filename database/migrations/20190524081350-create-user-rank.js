'use strict';

const tableName = 'userRanks';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
      JSON,
      DATE,
    } = Sequelize;

    return queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: {
        type: BIGINT,
        unique: true,
        allowNull: false,
      },

      project: {
        type: INTEGER,
        defaultValue: 0,
      },

      site: {
        type: INTEGER,
        defaultValue: 0,
      },

      world: {
        type: INTEGER,
        defaultValue: 0,
      },

      follow: {
        type: INTEGER,
        defaultValue: 0,
      },

      fans: {
        type: INTEGER,
        defaultValue: 0,
      },

      active: {
        type: INTEGER,
        defaultValue: 0,
      },

      extra: {
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
