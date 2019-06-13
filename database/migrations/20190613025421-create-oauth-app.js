'use strict';

const tableName = 'oauthApps';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      BIGINT,
      STRING,
      TEXT,
      JSON,
      DATE,
    } = Sequelize;

    await queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: { // 文件所属者
        type: BIGINT,
        defaultValue: 0,
      },

      appName: {
        type: STRING,
        defaultValue: '',
        allowNull: false,
      },

      clientId: {
        type: STRING,
        unique: true,
        defaultValue: '',
      },

      clientSecret: {
        type: STRING,
        defaultValue: '',
      },

      description: {
        type: TEXT,
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
          fields: [ 'userId', 'appName' ],
        },
      ],
    });

    return queryInterface.addIndex(
      tableName,
      [ 'userId', 'appName' ],
      { unique: true }
    );
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
