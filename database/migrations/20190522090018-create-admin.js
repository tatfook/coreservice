'use strict';

const tableName = 'admins';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
      STRING,
      JSON,
      DATE,
    } = Sequelize;

    return queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      username: {
        type: STRING(48),
        unique: true,
        allowNull: false,
      },

      password: {
        type: STRING(48),
        allowNull: false,
      },

      roleId: {
        type: INTEGER,
        defaultValue: 0,
      },

      email: {
        type: STRING(64),
        unique: true,
      },

      cellphone: {
        type: STRING(24),
        unique: true,
      },

      realname: {
        type: STRING(24),
      },

      nickname: {
        type: STRING(48),
      },

      portrait: {
        type: STRING(1024),
      },

      sex: {
        type: STRING(4),
      },

      description: {
        type: STRING(512),
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
