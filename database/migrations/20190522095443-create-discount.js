'use strict';

const tableName = 'discounts';

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

      userId: { // 用户ID
        type: BIGINT,
        allowNull: false,
      },

      type: { // 优惠券类型  0 - 通用性  1 - 课程包
        type: INTEGER,
        defaultValue: 0,
      },

      state: { // 状态
        type: INTEGER,
        defaultValue: 0,
      },

      rmb: { // 满人民币可使用
        type: INTEGER,
        defaultValue: 0,
      },

      coin: { // 满知识币可使用
        type: INTEGER,
        defaultValue: 0,
      },

      bean: { // 满知识豆可使用
        type: INTEGER,
        defaultValue: 0,
      },

      rewardRmb: { // 奖励rmb
        type: INTEGER,
        defaultValue: 0,
      },

      rewardCoin: { // 奖励coin
        type: INTEGER,
        defaultValue: 0,
      },

      rewardBean: { // 奖励bean
        type: INTEGER,
        defaultValue: 0,
      },

      title: { // 优惠券标题
        type: STRING,
        defaultValue: '',
      },

      description: { // 优惠券描述  备注
        type: STRING,
        defaultValue: '',
      },

      startTime: { // 开始日期
        type: BIGINT,
      },

      endTime: { // 结束日期
        type: BIGINT,
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
