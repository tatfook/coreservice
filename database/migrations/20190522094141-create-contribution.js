'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
      JSON,
    } = Sequelize;

    return queryInterface.createTable('contributions', {
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
  },

  down: queryInterface => {
    return queryInterface.dropTable('contributions');
  },
};
