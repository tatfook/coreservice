'use strict';

const tableName = 'visitors';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
      STRING,
      TEXT,
      JSON,
      DATE,
    } = Sequelize;

    await queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      url: { // url
        type: STRING,
        allowNull: false,
      },

      date: { // 统计日期
        type: STRING(24),
        allowNull: false,
        defaultValue: '',
      },

      count: {
        type: INTEGER,
        defaultValue: 0,
      },

      visitors: { // 访客的用户id列表  使用字符串而不用数组原因是字符串可模糊查找  数组则不可查询
        type: TEXT,
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
          fields: [ 'url', 'date' ],
        },
      ],
    });

    return queryInterface.addIndex(
      tableName,
      [ 'url', 'date' ],
      { unique: true }
    );
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
