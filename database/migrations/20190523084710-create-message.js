'use strict';

const tableName = 'messages';

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

      sender: { // 消息发送者
        type: BIGINT,
      },

      type: { // 消息类型 0 - 系统消息
        type: INTEGER,
        defaultValue: 0,
      },

      all: { // 0 - 非全部  1 - 全部
        type: INTEGER,
        defaultValue: 0,
      },

      msg: {
        type: JSON,
        defaultValue: {},
      },

      // recvIds: {
      // type:
      // }

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
