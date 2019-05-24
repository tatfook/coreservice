'use strict';

module.exports = app => {
  const {
    BIGINT,
    INTEGER,
    STRING,
    DATE,
  } = app.Sequelize;

  const model = app.model.define('tags', {
    id: {
      type: BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: { // 评论者
      type: BIGINT,
    },

    tagId: {
      type: STRING(24),
      allowNull: false,
    },

    objectType: { // 评论对象类型  0 -- 用户  1 -- 站点  2 -- 页面
      type: INTEGER,
      allowNull: false,
    },

    objectId: { // 评论对象id
      type: BIGINT,
      allowNull: false,
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
        fields: [ 'tagId', 'objectId', 'objectType' ],
      },
    ],
  });

  // model.sync({force:true}).then(() => {
  // console.log("create table successfully");
  // });

  app.model.tags = model;
  return model;
};

