'use strict';

const tableName = 'paracraftNews';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      STRING,
      TEXT,
      JSON,
      DATE,
    } = Sequelize;

    return queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      title: { // 标题
        type: STRING,
        defaultValue: '',
      },

      description: { // 描述
        type: TEXT,
      },

      date: { // 发布日期
        type: DATE,
      },

      url: { // 地址
        type: STRING,
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
