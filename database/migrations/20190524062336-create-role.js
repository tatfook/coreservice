'use strict';

const tableName = 'roles';

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

      userId: { // 用户ID
        type: BIGINT,
        allowNull: false,
      },

      roleId: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      startTime: { // 开始时间
        type: BIGINT,
        defaultValue: 0,
      },

      endTime: { // 结束时间
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
      indexes: [
        {
          unique: true,
          fields: [ 'userId', 'roleId' ],
        },
      ],
    });

    return queryInterface.addIndex(
      tableName,
      [ 'userId', 'roleId' ],
      { unique: true }
    );
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
