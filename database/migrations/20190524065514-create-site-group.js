'use strict';

const tableName = 'siteGroups';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
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

      siteId: {
        type: BIGINT,
        allowNull: false,
      },

      groupId: {
        type: BIGINT,
        allowNull: false,
      },

      level: {
        type: INTEGER,
        defaultValue: 0,
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
          fields: [ 'siteId', 'groupId' ],
        },
      ],
    });

    return queryInterface.addIndex(
      tableName,
      [ 'siteId', 'groupId' ],
      { unique: true }
    );
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
