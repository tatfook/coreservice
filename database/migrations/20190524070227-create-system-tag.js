'use strict';

const tableName = 'systemTags';

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

      classify: {
        type: INTEGER,
        defaulValue: 0,
      },

      tagname: {
        type: STRING(24),
        allowNull: false,
      },

      extra: {
        type: JSON,
        defaulValue: {},
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
          fields: [ 'classify', 'tagname' ],
        },
      ],
    });

    return queryInterface.addIndex(
      tableName,
      [ 'classify', 'tagname' ],
      { unique: true }
    );
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
