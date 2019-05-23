'use strict';

const tableName = 'groups';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      BIGINT,
      STRING,
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

      groupname: {
        type: STRING(48),
        allowNull: false,
      },

      description: {
        type: STRING(128),
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
          fields: [ 'userId', 'groupname' ],
        },
      ],
    });

    return queryInterface.addIndex(
      tableName,
      [ 'userId', 'groupname' ],
      { unique: true }
    );
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
