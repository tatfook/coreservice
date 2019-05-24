'use strict';

const tableName = 'paracraftVisitors';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
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

      handler: {
        type: BIGINT,
        defaultValue: 0,
      },

      realname: { // 姓名
        type: STRING(64),
        defaultValue: '',
      },

      cellphone: { // 电话
        type: STRING(24),
        defaultValue: '',
        unique: true,
      },

      email: { // 邮箱
        type: STRING,
      },

      organization: { // 组织 机构
        type: STRING,
        defaultValue: '',
      },

      description: { // 描述
        type: STRING,
        defaultValue: '',
      },

      state: {
        type: INTEGER,
        defaultValue: 0,
      },

      remark: {
        type: TEXT,
        defaultValue: '',
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
