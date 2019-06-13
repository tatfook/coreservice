'use strict';

const tableName = 'userMessages';

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
      },

      messageId: {
        type: BIGINT,
      },

      state: { // 0 - 未读  1 - 已读
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
          fields: [ 'userId', 'messageId' ],
        },
      ],
    });

    return queryInterface.addIndex(
      tableName,
      [ 'userId', 'messageId' ],
      { unique: true }
    );
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
