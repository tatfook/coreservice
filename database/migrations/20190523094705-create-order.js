'use strict';

const tableName = 'orders';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      STRING,
      JSON,
      DECIMAL,
      DATE,
    } = Sequelize;

    return queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: { // 用户ID
        type: BIGINT,
        allowNull: false,
      },

      orderNo: {
        type: STRING(64), // 交易号
        unique: true,
      },

      amount: { // 金额
        type: DECIMAL(10, 2),
        defaultValue: 0,
      },

      state: {
        type: BIGINT, // 交易状态
      },

      channel: { // 支付渠道
        type: STRING(16),
      },

      tradeId: { // 交易ID
        type: BIGINT,
        defaultValue: 0,
      },

      chargeId: {
        type: STRING(64), // pingppId
      },

      refundId: {
        type: STRING(64), // pingppId
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
