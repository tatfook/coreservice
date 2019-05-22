'use strict';

const tableName = 'events';

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

      eventId: {
        type: INTEGER,
        defaultValue: 0,
      },

      value: {
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
          fields: [ 'eventId' ],
        },
      ],
    });

    return queryInterface.addIndex(tableName, [ 'eventId' ]);
  },

  down: queryInterface => {
    return queryInterface.dropTable('events');
  },
};
