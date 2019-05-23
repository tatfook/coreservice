'use strict';

const tableName = 'locations';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      FLOAT,
      DATE,
    } = Sequelize;

    return queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: {
        type: BIGINT,
        unique: true,
        allowNull: false,
      },

      longitude: { // 经度
        type: FLOAT(10, 6),
      },

      latitude: { // 维度
        type: FLOAT(10, 6),
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
    });

  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
