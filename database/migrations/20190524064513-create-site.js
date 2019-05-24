'use strict';

const tableName = 'sites';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
      STRING,
      JSON,
      DATE,
    } = Sequelize;

    await queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: {
        type: BIGINT,
        allowNull: false,
      },

      username: {
        type: STRING(64),
      },

      sitename: {
        type: STRING(256),
        allowNull: false,
      },

      displayName: {
        type: STRING(64),
      },

      visibility: {
        type: INTEGER, // public private
        defaultValue: 0,
      },

      description: {
        type: STRING(1024),
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
      indexes: [
        {
          unique: true,
          fields: [ 'userId', 'sitename' ],
        },
      ],
    });

    return queryInterface.addIndex(
      tableName,
      [ 'userId', 'sitename' ],
      { unique: true }
    );
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
