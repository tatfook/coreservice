'use strict';


module.exports = app => {
  const {
    BIGINT,
    INTEGER,
    DATE,
  } = app.Sequelize;

  const model = app.model.define('userMessages', {
    id: {
      type: BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: BIGINT,
    },

    messageId: {
      type: BIGINT,
    },

    state: { // 0 - 未读  1 - 已读
      type: INTEGER,
      defaultValue: 0,
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

  app.model.userMessages = model;

  return model;
};
