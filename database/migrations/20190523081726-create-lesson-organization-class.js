'use strict';

const tableName = 'lessonOrganizationClasses';

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

      organizationId: {
        type: BIGINT,
        defaultValue: 0,
      },

      name: {
        type: STRING,
      },

      begin: {
        type: DATE,
        defaultValue() {
          return new Date();
        },
      },

      end: {
        type: DATE,
        defaultValue() {
          return new Date();
        },
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
          fields: [ 'organizationId', 'name' ],
        },
      ],
    });

    return queryInterface.addIndex(
      tableName,
      [ 'organizationId', 'name' ],
      { unique: true }
    );
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
