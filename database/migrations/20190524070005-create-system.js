'use strict';

const tableName = 'systems';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      FLOAT,
      JSON,
      DATE,
    } = Sequelize;

    return queryInterface.createTable(tableName, {
    // 记录ID
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      // 项目数量
      project: {
        type: BIGINT,
        defaultValue: 0,
      },

      // 用户数量
      user: {
        type: BIGINT,
        defaultValue: 0,
      },

      // 项目平均分
      projectAvgRate: {
        type: FLOAT,
        defaultValue: 0,
      },

      // 用户平均分
      userAvgRate: {
        type: FLOAT,
        defaultValue: 0,
      },

      // 额外数据
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
