'use strict';

const tableName = 'projectRanks';

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
        allowNull: false,
      },

      projectId: {
        type: BIGINT,
        unique: true,
        allowNull: false,
      },

      comment: {
        type: INTEGER,
        defaultValue: 0,
      },

      visit: {
        type: INTEGER,
        defaultValue: 0,
      },

      star: {
        type: INTEGER,
        defaultValue: 0,
      },

      favorite: {
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
