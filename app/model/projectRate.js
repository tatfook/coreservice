'use strict';

module.exports = app => {
  const {
    BIGINT,
    INTEGER,
    JSON,
    DATE,
  } = app.Sequelize;

  const model = app.model.define('projectRates', {
    // 记录ID
    id: {
      type: BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    // 用户Id
    userId: {
      type: BIGINT,
      defaultValue: 0,
    },

    // 项目Id
    projectId: {
      type: BIGINT,
      defaultValue: 0,
    },

    // 分数 0-100
    rate: {
      type: INTEGER,
      defaultValue: 0,
    },

    // 额外数据
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
        fields: [ 'userId', 'projectId' ],
      },
    ],
  });

  // model.sync({force:true}).then(() => {
  // console.log("create table successfully");
  // });

  model.__hook__ = async function(data, oper) {
    this.statisticsRate(data, oper);
  };

  app.model.projectRates = model;
  return model;
};

