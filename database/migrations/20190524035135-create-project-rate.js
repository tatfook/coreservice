'use strict';

const tableName = 'projectRates';

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

      // 用户Id
      userId: {
        type: BIGINT,
        defaultValue: 0,
      },

      // 项目Id
      projectId: {
        type: BIGINT,
        defaultValue: 0,
      },

      // 分数 0-100
      rate: {
        type: INTEGER,
        defaultValue: 0,
      },

      // 额外数据
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
          fields: [ 'userId', 'projectId' ],
        },
      ],
    });

    return queryInterface.addIndex(
      tableName,
      [ 'userId', 'projectId' ],
      { unique: true }
    );
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
