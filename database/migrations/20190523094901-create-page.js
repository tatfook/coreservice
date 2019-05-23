'use strict';

const tableName = 'pages';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
      STRING,
      TEXT,
      DATE,
    } = Sequelize;

    return queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: {
        type: BIGINT,
      },

      siteId: {
        type: BIGINT,
      },

      url: {
        type: STRING(128),
        allowNull: false,
        unique: true,
      },

      folder: {
        type: STRING(128),
        allowNull: false,
      },

      hash: {
        type: STRING(64),
      },

      content: {
        type: TEXT('long'),
        // defaultValue: "",
      },

      keywords: {
        type: STRING,
      },

      title: {
        type: STRING(128),
      },

      description: {
        type: STRING(512),
      },

      visitors: { // 访客 id 列表  |1|2|3|
        type: TEXT,
        // defaultValue: "|",
      },

      visitorCount: { // 访问量
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
