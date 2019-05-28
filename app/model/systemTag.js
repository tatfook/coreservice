'use strict';

module.exports = app => {
  const {
    BIGINT,
    INTEGER,
    STRING,
    JSON,
    DATE,
  } = app.Sequelize;

  const model = app.model.define('systemTags', {
    id: {
      type: BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    classify: {
      type: INTEGER,
      defaulValue: 0,
    },

    tagname: {
      type: STRING(24),
      allowNull: false,
    },

    extra: {
      type: JSON,
      defaulValue: {},
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
        fields: [ 'classify', 'tagname' ],
      },
    ],
  });

  model.associate = function() {
    app.model.systemTags.hasMany(app.model.tags, {
      as: 'tags',
      foreignKey: 'tagId',
      sourceKey: 'id',
      constraints: false,
    });
  };

  // model.sync({force:true}).then(() => {
  // console.log("create table successfully");
  // });

  app.model.systemTags = model;
  return model;
};

