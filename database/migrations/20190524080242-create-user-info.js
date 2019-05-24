'use strict';

const tableName = 'userinfos';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      STRING,
      DATE,
      JSON,
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

      name: {
        type: STRING(48), // 用户姓名
      },

      qq: {
        type: STRING(24), // qq号
      },

      birthdate: { // 出生年月
        type: DATE,
      },

      school: { // 学校
        type: STRING,
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
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
