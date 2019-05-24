'use strict';

const tableName = 'worlds';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      BIGINT,
      STRING,
      JSON,
      DATE,
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

      worldName: { // 世界名
        type: STRING(128),
        allowNull: false,
      },

      revision: { // 版本
        type: STRING(32),
        allowNull: false,
        defaultValue: 0,
      },

      projectId: { // 项目id
        type: BIGINT,
        allowNull: false,
        unique: true,
      },

      commitId: { // 最后一次提价id
        type: STRING(64),
        defaultValue: 'master',
      },

      archiveUrl: { // git archive url
        type: STRING(255),
        defaultValue: '',
      },

      fileSize: { // 文件大小
        type: BIGINT,
        defaultValue: 0,
      },

      giturl: { // git url
        type: STRING(256),
      },

      download: { // 下载地址
        type: STRING(256),
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

      // 默认字段 updatedAt修改日期  createdAt创建日期
    }, {
      underscored: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_bin',
      indexes: [
        {
          unique: true,
          fields: [ 'userId', 'worldName' ],
        },
        {
          unique: true,
          fields: [ 'projectId' ],
        },
      ],
    });

    await queryInterface.addIndex(
      tableName,
      [ 'userId', 'worldName' ],
      { unique: true }
    );

    return queryInterface.addIndex(
      tableName,
      [ 'projectId' ],
      { unique: true }
    );
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
