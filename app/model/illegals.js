'use strict';

const _ = require('lodash');
const {
  ENTITY_TYPE_USER,
  ENTITY_TYPE_SITE,
  ENTITY_TYPE_PROJECT,
} = require('../core/consts.js');

module.exports = app => {
  const {
    BIGINT,
    INTEGER,
    TEXT,
    JSON,
    DATE,
  } = app.Sequelize;

  const model = app.model.define('illegals', {
    id: { // id
      type: BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    objectId: { // 对象id
      type: BIGINT,
      defaultValue: 0,
    },

    objectType: { // 对象类型  0 - 用户 1 - 站点  5 - 项目
      type: INTEGER,
      defaultValue: 0,
    },

    handler: { // 操作者id 应为admin中的用户id
      type: BIGINT,
      defaultValue: 0,
    },

    description: { // 不合法原因
      type: TEXT,
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

    indexes: [
      {
        unique: true,
        fields: [ 'objectId', 'objectType' ],
      },
    ],
  });

  // model.sync({force:true});

  model.__hook__ = async function(data, oper) {
    const objectId = data.objectId;
    if (oper === 'destroy') { // 解封
      if (data.objectType === ENTITY_TYPE_USER) {
        const user = await app.model.users.findOne({ where: { id: objectId } }).then(o => o && o.toJSON());
        const projects = await app.model.projects.findAll({ where: { userId: objectId } }).then(list => _.map(list, o => o.toJSON()));
        await app.api.usersUpsert(user);
        for (let i = 0; i < projects.length; i++) {
          await app.api.projectsUpsert(projects[i]);
        }
      } else if (data.objectType === ENTITY_TYPE_PROJECT) {
        await app.model.query(`call p_enable_project(${objectId})`);
        const project = await app.model.projects.findOne({ where: { id: objectId } }).then(o => o && o.toJSON());
        await app.api.projectsUpsert(project);
      } else if (data.objectType === ENTITY_TYPE_SITE) {
        await app.model.query(`call p_enable_site(${objectId})`);
      }
    } else { // 封停
      if (data.objectType === ENTITY_TYPE_USER) {
        const user = await app.model.users.findOne({ where: { id: objectId } }).then(o => o && o.toJSON());
        const projects = await app.model.projects.findAll({ where: { userId: objectId } }).then(list => _.map(list, o => o.toJSON()));
        await app.model.query(`call p_disable_user(${objectId})`);
        await app.api.usersDestroy(user);
        for (let i = 0; i < projects.length; i++) {
          await app.api.projectsDestroy(projects[i]);
        }
      } else if (data.objectType === ENTITY_TYPE_PROJECT) {
        const project = await app.model.projects.findOne({ where: { id: objectId } }).then(o => o && o.toJSON());
        await app.model.query(`call p_disable_project(${objectId})`);
        await app.api.projectsDestroy(project);
      } else if (data.objectType === ENTITY_TYPE_SITE) {
        await app.model.query(`call p_disable_site(${objectId})`);
      }
    }
  };

  app.model.illegals = model;

  return model;
};
