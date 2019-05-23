'use strict';

const tableName = 'illegals';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
      TEXT,
      JSON,
      DATE,
    } = Sequelize;

    await queryInterface.createTable(tableName, {
      id: { // id
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      objectId: { // 对象id
        type: BIGINT,
        defaultValue: 0,
      },

      objectType: { // 对象类型  0 - 用户 1 - 站点  5 - 项目
        type: INTEGER,
        defaultValue: 0,
      },

      handler: { // 操作者id 应为admin中的用户id
        type: BIGINT,
        defaultValue: 0,
      },

      description: { // 不合法原因
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

      indexes: [
        {
          unique: true,
          fields: [ 'objectId', 'objectType' ],
        },
      ],
    });

    return queryInterface.addIndex(
      tableName,
      [ 'objectId', 'objectType' ],
      { unique: true }
    );
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
