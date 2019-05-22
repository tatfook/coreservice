'use strict';

const _ = require('lodash');
const {
  ENTITY_TYPE_ISSUE,
  ENTITY_TYPE_PROJECT,
} = require('../core/consts.js');

module.exports = app => {
  const {
    BIGINT,
    INTEGER,
    STRING,
    TEXT,
    JSON,
    DATE,
  } = app.Sequelize;

  const model = app.model.define('comments', {
    id: {
      type: BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: { // 评论者
      type: BIGINT,
      allowNull: false,
    },

    objectType: { // 评论对象类型  0 -- 用户  1 -- 站点  2 -- 页面
      type: INTEGER,
      allowNull: false,
    },

    objectId: { // 评论对象id
      type: STRING,
      allowNull: false,
    },

    content: { // 评论内容
      type: TEXT,
      // defaultValue:"",
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

  // model.sync({force:true}).then(() => {
  // console.log("create table successfully");
  // });

  model.__hook__ = async function(data, oper) {
    if (oper === 'create' && (data.objectType === ENTITY_TYPE_PROJECT || data.objectType === ENTITY_TYPE_ISSUE)) {
      // 项目评论 ISSUE回复  活跃度加1
      await app.model.contributions.addContributions(data.userId);
    }
  };

  model.createComment = async function(userId, objectId, objectType, content) {
    const user = await app.model.users.getById(userId);
    if (!user) return;

    objectId = _.toString(objectId);
    const data = await app.model.comments.create({
      userId,
      objectType,
      objectId,
      content,
      extra: {
        username: user.username,
        nickname: user.nickname,
        portrait: user.portrait,
      },
    });
    if (!data) return;

    if (data.objectType === ENTITY_TYPE_PROJECT && app.model.projects.commentCreateHook) {
      await app.model.projects.commentCreateHook(data.objectId);
    }

    return data.get({ plain: true });
  };

  model.deleteComment = async function(id, userId) {
    const where = { id };

    if (userId) where.userId = userId;

    const data = await app.model.comments.findOne({ where });
    if (!data) return;

    await app.model.comments.destroy({ where });

    if (data.objectType === ENTITY_TYPE_PROJECT && app.model.projects.commentDestroyHook) {
      await app.model.projects.commentDestroyHook(data.objectId);
    }
  };

  model.getObjectsCount = async function(objectIds, objectType) {
    _.each(objectIds, (val, i) => {
      objectIds[i] = _.toString(val);
    });
    const sql = 'select objectId, count(*) count from comments where objectType = :objectType and objectId in (:objectIds) group by objectId';
    const list = await app.model.query(sql, {
      type: app.Sequelize.QueryTypes.Sequelize,
      replacements: { objectIds, objectType },
    });

    const counts = {};
    _.each(list, o => {
      counts[o.objectId] = o.count;
    });

    return counts;
  };

  app.model.comments = model;
  return model;
};
