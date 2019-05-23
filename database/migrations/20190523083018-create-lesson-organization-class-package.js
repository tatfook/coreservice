'use strict';

const tableName = 'lessonOrganizationPackages';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      BIGINT,
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

      classId: {
        type: BIGINT,
        defaultValue: 0,
      },

      packageId: {
        type: BIGINT,
        defaultValue: 0,
      },

      lessons: {
        type: JSON,
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
          fields: [ 'organizationId', 'classId', 'packageId' ],
        },
      ],
    });

    return queryInterface.addIndex(
      tableName,
      [ 'organizationId', 'classId', 'packageId' ],
      { unique: true }
    );
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
