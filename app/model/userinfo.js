'use strict';

module.exports = app => {
  const {
    BIGINT,
    STRING,
    DATE,
    JSON,
  } = app.Sequelize;

  const attrs = {
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

  };

  const opts = {
    underscored: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_bin',
  };

  const model = app.model.define('userinfos', attrs, opts);

  // model.sync({force:true});

  model.associate = function() {
    model.belongsTo(app.model.User, {
      as: 'users',
      foreignKey: 'userId',
      targetKey: 'id',
      constraints: false,
    });
  };

  app.model.userinfos = model;

  return model;
};
