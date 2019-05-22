'use strict';

const tableName = 'contributions';

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

      userId: { // 评论者
        type: BIGINT,
        allowNull: false,
      },

      year: {
        type: INTEGER,
        defaultValue: 0,
      },

      data: {
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
          fields: [ 'userId', 'year' ],
        },
      ],
    });

    return queryInterface.addIndex(tableName, [ 'userId', 'year' ]);
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
