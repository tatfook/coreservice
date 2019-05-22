'use strict';

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

    return queryInterface.createTable('comments', {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: { // 评论者
        type: BIGINT,
        allowNull: false,
      },

      objectType: { // 评论对象类型  0 -- 用户  1 -- 站点  2 -- 页面
        type: INTEGER,
        allowNull: false,
      },

      objectId: { // 评论对象id
        type: STRING,
        allowNull: false,
      },

      content: { // 评论内容
        type: TEXT,
        // defaultValue:"",
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
    return queryInterface.dropTable('comments');
  },
};
