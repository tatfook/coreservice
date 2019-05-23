'use strict';

const tableName = 'favorites';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
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

      objectId: {
        type: BIGINT,
        allowNull: false,
      },

      objectType: {
        type: INTEGER,
        allowNull: false,
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
          fields: [ 'userId', 'objectId', 'objectType' ],
        },
      ],
    });

    return queryInterface.addIndex(tableName, [ 'userId', 'objectId', 'objectType' ]);
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
