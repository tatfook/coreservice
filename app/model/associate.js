'use strict';

module.exports = app => {
  const {
    BIGINT,
    INTEGER,
    DATE,
    JSON,
  } = app.Sequelize;

  // source 为资源本身   target为所属者  source属于target   如项目成员    sourceId: 为成员id   targetId: 为项目id
  const attrs = {
    id: {
      type: BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    sourceType: { // 源类型
      type: INTEGER,
      defaultValue: 0,
    },

    sourceId: { // 源Id
      type: BIGINT,
      defaultValue: 0,
    },

    targetType: { // 目标类型
      type: INTEGER,
      defaultValue: 0,
    },

    targetId: { // 目标Id
      type: BIGINT,
      defaultValue: 0,
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

  };

  const opts = {
    underscored: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_bin',
  };

  const model = app.model.define('associates', attrs, opts);

  // model.sync({force:true});

  app.model.associates = model;

  return model;
};

