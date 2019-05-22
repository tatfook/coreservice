'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      STRING,
      JSON,
    } = Sequelize;

    return queryInterface.createTable('caches', {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      key: { // 文件所属者
        type: STRING,
        allowNull: false,
        unique: true,
      },

      value: {
        type: JSON,
      },

      expire: {
        type: BIGINT,
        defaultValue: 0,
      },

    }, {
      underscored: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_bin',
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('caches');
  },
};
