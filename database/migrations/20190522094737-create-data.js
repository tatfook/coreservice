'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      JSON,
    } = Sequelize;
    return queryInterface.createTable('datas', {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: { // 评论者
        type: BIGINT,
        allowNull: false,
        unique: true,
      },

      data: {
        type: JSON,
        defaultValue: {},
      },
    }, {
      underscored: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_bin',
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('datas');
  },
};
