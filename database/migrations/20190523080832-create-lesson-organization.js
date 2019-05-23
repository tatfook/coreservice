'use strict';

const tableName = 'lessonOrganizations';

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

      name: { // 名称
        type: STRING,
        defaultValue: '',
        unique: true,
      },

      logo: {
        type: TEXT('long'),
      },

      email: {
        type: STRING,
      },

      cellphone: {
        type: STRING,
      },

      loginUrl: {
        type: STRING,
        unique: true,
      },

      userId: { // 组织拥有者
        type: BIGINT,
        defaultValue: 0,
      },

      startDate: {
        type: DATE,
      },

      endDate: {
        type: DATE,
      },

      state: { // 0 - 开启  1 - 停用
        type: INTEGER,
      },

      count: { // 用户数量
        type: INTEGER,
        defaultValue: 0,
      },

      privilege: { // 权限  1 -- 允许教师添加学生  2 -- 允许教师移除学生
        type: INTEGER,
        defaultValue: 0,
      },

      location: { // xxx xxx xxx
        type: STRING,
        defaultValue: '',
      },

      visibility: { // 0 - 公开  1 - 不公开
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
