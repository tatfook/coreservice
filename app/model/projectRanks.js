'use strict';

module.exports = app => {
  const {
    BIGINT,
    INTEGER,
    JSON,
    DATE,
  } = app.Sequelize;

  const model = app.model.define('projectRanks', {
    id: {
      type: BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: BIGINT,
      allowNull: false,
    },

    projectId: {
      type: BIGINT,
      unique: true,
      allowNull: false,
    },

    comment: {
      type: INTEGER,
      defaultValue: 0,
    },

    visit: {
      type: INTEGER,
      defaultValue: 0,
    },

    star: {
      type: INTEGER,
      defaultValue: 0,
    },

    favorite: {
      type: INTEGER,
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

  }, {
    underscored: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_bin',
  });

  // model.sync({force:true});

  model.getByProjectId = async function(projectId) {
    let rank = await app.model.projectRanks.findOne({ where: { projectId } });
    if (!rank) rank = await app.model.projectRanks.create({ projectId });

    return rank && rank.get({ plain: true });
  };

  app.model.projectRanks = model;

  return model;
};

