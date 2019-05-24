'use strict';

const tableName = 'storages';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
      DATE,
    } = Sequelize;

    return queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: { // 文件所属者
        type: BIGINT,
        unique: true,
        allowNull: false,
      },

      total: {
        type: BIGINT,
        defaultValue: 2 * 1024 * 1024 * 1024,
      },

      used: {
        type: BIGINT,
        defaultValue: 0,
      },

      fileCount: {
        type: INTEGER,
        defaultValue: 0,
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
