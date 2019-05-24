'use strict';

const tableName = 'siteFiles';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      BIGINT,
      DATE,
    } = Sequelize;

    await queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      fileId: { // 文件ID
        type: BIGINT,
        allowNull: false,
      },

      userId: { // 文件使用位置的的用户名
        type: BIGINT,
        allowNull: false,
      },

      siteId: { // 文件使用位置的站点名
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
          fields: [ 'fileId', 'userId', 'siteId' ],
        },
      ],
    });

    return queryInterface.addIndex(
      tableName,
      [ 'fileId', 'userId', 'siteId' ],
      { unique: true }
    );
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
