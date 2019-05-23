'use strict';

const tableName = 'gameWorks';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
      STRING,
      DATE,
      JSON,
    } = Sequelize;

    await queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: { // 用户id
        type: BIGINT,
        allowNull: false,
      },

      gameId: { // 比赛id
        type: BIGINT,
        allowNull: false,
      },

      projectId: { // 项目id
        type: BIGINT,
        allowNull: false,
      },

      worksName: { // 作品名称
        type: STRING,
      },

      worksSubject: { // 作品主题
        type: STRING,
      },

      worksLogo: { // 作品封面
        type: STRING(512),
      },

      worksDescription: { // 作品简介
        type: STRING(2048),
      },

      worksRate: { // 作品评分
        type: INTEGER,
      },

      worksRateCount: { // 作品评分人数
        type: INTEGER,
      },

      reward: { // 获奖情况
        type: STRING,
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
          fields: [ 'projectId' ],
        },
      ],
    });

    return queryInterface.addIndex(tableName, [ 'projectId' ]);
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
