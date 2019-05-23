'use strict';

const tableName = 'issues';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
      STRING,
      TEXT,
      JSON,
      DATE,
    } = Sequelize;

    await queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: { // 所属者者
        type: BIGINT,
        allowNull: false,
      },

      objectType: { // 所属对象类型  0 -- 用户  1 -- 站点  2 -- 页面 3 -- 组 4 -- 项目
        type: INTEGER,
        allowNull: false,
      },

      objectId: { // 所属对象id
        type: BIGINT,
        allowNull: false,
      },

      title: { // 内容
        type: STRING(256),
        defaultValue: '',
      },

      content: { // 内容
        type: TEXT,
        defaultValue: '',
      },

      state: { // 0 -- 进行中  1 -- 已完成
        type: INTEGER,
        defaultValue: 0,
      },

      tags: {
        type: STRING(256),
        defaultValue: '|',
      },

      assigns: {
        type: STRING(256),
        defaultValue: '|',
      },

      no: { // issue 序号
        type: INTEGER,
        defaultValue: 1,
      },

      text: {
        type: TEXT, // issue 搜索文本
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

      indexes: [
        {
          unique: true,
          fields: [ 'objectId', 'objectType', 'no' ],
        },
      ],
    });

    return queryInterface.addIndex(
      tableName,
      [ 'objectId', 'objectType', 'no' ],
      { unique: true }
    );
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
