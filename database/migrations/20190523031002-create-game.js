'use strict';

const tableName = 'games';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
      STRING,
      DATE,
    } = Sequelize;

    return queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      type: {
        type: INTEGER, // 0 -- NPL 大赛
        defaultValue: 0,
      },

      name: {
        type: STRING(48), // 大赛名称
      },

      no: { // 期号
        type: INTEGER,
      },

      startDate: {
        type: STRING(24), // 开始日期
      },

      endDate: { // 结束日期
        type: DATE,
      },

      state: { // 0 -- 未开始  1 -- 进行中  2 -- 已结束
        type: INTEGER,
        defaultValue: 0,
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
