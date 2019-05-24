'use strict';

const tableName = 'tags';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
      STRING,
      DATE,
    } = Sequelize;

    await queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: { // 评论者
        type: BIGINT,
      },

      tagId: {
        type: STRING(24),
        allowNull: false,
      },

      objectType: { // 评论对象类型  0 -- 用户  1 -- 站点  2 -- 页面
        type: INTEGER,
        allowNull: false,
      },

      objectId: { // 评论对象id
        type: BIGINT,
        allowNull: false,
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
          fields: [ 'tagId', 'objectId', 'objectType' ],
        },
      ],
    });

    return queryInterface.addIndex(
      tableName,
      [ 'tagId', 'objectId', 'objectType' ],
      { unique: true }
    );
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
