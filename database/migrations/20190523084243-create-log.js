'use strict';

const tableName = 'logs';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      STRING,
      TEXT,
      DATE,
    } = Sequelize;

    return queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      level: {
        type: STRING(12),
        defaultValue: 'DEBUG',
      },

      text: {
        type: TEXT,
        defaultValue: '',
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
