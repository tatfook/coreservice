'use strict';

module.exports = app => {
  const {
    BIGINT,
    STRING,
    JSON,
    DATE,
  } = app.Sequelize;

  const model = app.model.define('sensitiveWords', {
    id: {
      type: BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    word: {
      type: STRING,
      // unique: true,
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

    // 默认字段 updatedAt修改日期  createdAt创建日期
  }, {
    underscored: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_bin',
  });

  // model.sync({force:true}).then(() => {
  // console.log("create table successfully");
  // });

  app.model.sensitiveWords = model;
  return model;
};

