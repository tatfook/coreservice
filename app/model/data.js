'use strict';

const _ = require('lodash');

module.exports = app => {
  const {
    BIGINT,
    JSON,
    DATE,
  } = app.Sequelize;

  const model = app.model.define('datas', {
    id: {
      type: BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: { // 评论者
      type: BIGINT,
      allowNull: false,
      unique: true,
    },

    data: {
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

  model.put = async function(userId, data) {
    const olddata = await this.get(userId);
    _.merge(olddata, data);
    return await this.set(userId, olddata);
  };

  model.set = async function(userId, data = {}) {
    return await app.model.datas.update({ data }, { where: { userId } });
  };

  model.get = async function(userId) {
    const data = await app.model.datas.findOne({ where: { userId } });

    return data ? data.get({ plain: true }).data : {};
  };

  app.model.datas = model;
  return model;
};

