'use strict';

module.exports = app => {
  const {
    BIGINT,
    INTEGER,
    STRING,
    JSON,
    DATE,
  } = app.Sequelize;

  const model = app.model.define('paracraftDevices', {
    id: {
      type: BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    deviceId: { // 设备id
      type: STRING,
      unique: true,
    },

    password: { // 设备密码
      type: STRING,
      defaultValue: '123456',
      allowNull: false,
    },

    username: { // 设备拥有者姓名
      type: STRING(64),
      defaultValue: '',
    },

    cellphone: { // 拥有者电话
      type: STRING(24),
      defaultValue: '',
    },

    price: { // 设备价格
      type: INTEGER,
      defaultValue: 0,
    },

    purchaseTime: { // 购买时间
      type: DATE,
    },

    gameCoin: { // 设备游戏币
      type: INTEGER,
      defaultValue: 0,
    },

    description: { // 备注
      type: STRING,
      defaultValue: '',
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

  // model.sync({force:true}).then(() => {
  // console.log("create table successfully");
  // });

  app.model.paracraftDevices = model;
  return model;
};

