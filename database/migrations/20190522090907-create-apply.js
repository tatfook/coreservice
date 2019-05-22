'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
      STRING,
      JSON,
    } = Sequelize;

    return queryInterface.createTable('applies', {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: { // 所属者 记录创建者
        type: BIGINT,
        allowNull: false,
      },

      objectType: { // 所属对象类型  0 -- 用户  1 -- 站点  2 -- 页面
        type: INTEGER,
        allowNull: false,
      },

      objectId: { // 所属对象id
        type: BIGINT,
        allowNull: false,
      },

      applyId: { // 申请Id
        type: BIGINT,
        allowNull: false,
      },

      applyType: { // 申请类型
        type: INTEGER,
        defaultValue: 0,
      },

      state: {
        type: INTEGER, // 状态 0 --  未处理态  1 -- 同意  2 -- 拒绝
        defaultValue: 0,
      },

      legend: { // 备注
        type: STRING(255),
        defaultValue: '',
      },

      extra: {
        type: JSON,
        defaultValue: {},
      },

    }, {
      underscored: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_bin',

      indexes: [{
        unique: true,
        fields: [ 'objectId', 'objectType', 'applyId', 'applyType' ],
      }],
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('applies');
  },
};
