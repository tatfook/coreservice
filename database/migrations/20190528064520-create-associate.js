'use strict';

const tableName = 'associates';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
      DATE,
      JSON,
    } = Sequelize;

    return queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      sourceType: { // 源类型
        type: INTEGER,
        defaultValue: 0,
      },

      sourceId: { // 源Id
        type: BIGINT,
        defaultValue: 0,
      },

      targetType: { // 目标类型
        type: INTEGER,
        defaultValue: 0,
      },

      targetId: { // 目标Id
        type: BIGINT,
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
