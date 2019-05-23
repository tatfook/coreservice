'use strict';

const tableName = 'oauthUsers';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
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

      userId: { // 文件所属者
        type: BIGINT,
        defaultValue: 0,
      },

      externalId: {
        type: STRING(128),
        allowNull: false,
      },

      externalUsername: {
        type: STRING,
        defaultValue: '',
      },

      type: {
        type: INTEGER,
        allowNull: false,
      },

      token: {
        type: STRING,
        defaultValue: '',
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
          fields: [ 'externalId', 'type' ],
        },
      ],
    });

    return queryInterface.addIndex(
      tableName,
      [ 'externalId', 'type' ],
      { unique: true }
    );
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
