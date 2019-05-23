'use strict';

const tableName = 'members';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
      JSON,
      DATE,
    } = Sequelize;

    await queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: { // 所属者
        type: BIGINT,
        allowNull: false,
      },

      objectType: { // 所属对象类型  0 -- 用户  1 -- 站点  2 -- 页面
        type: INTEGER,
        allowNull: false,
      },

      objectId: { // 所属对象id
        type: BIGINT,
        allowNull: false,
      },

      memberId: { // 成员Id
        type: BIGINT,
        allowNull: false,
      },

      level: { // 权限级别
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

      indexes: [
        {
          unique: true,
          fields: [ 'objectId', 'objectType', 'memberId' ],
        },
      ],
    });

    return queryInterface.addIndex(
      tableName,
      [ 'objectId', 'objectType', 'memberId' ],
      { unique: true }
    );
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
