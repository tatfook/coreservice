/* eslint-disable no-magic-numbers */
'use strict';
const _ = require('lodash');

const { ENTITY_TYPE_PROJECT, USER_ATTRS } = require('../core/consts.js');

module.exports = app => {
    const { BIGINT, INTEGER, STRING, TEXT, JSON } = app.Sequelize;
    // objectType未来表大时要考虑拆表 TODO
    const model = app.model.define(
        'issues',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            userId: {
                // 所属者者
                type: BIGINT,
                allowNull: false,
            },

            objectType: {
                // 所属对象类型  0 -- 用户  1 -- 站点  2 -- 页面 3 -- 组 4 -- 项目
                type: INTEGER,
                allowNull: false,
            },

            objectId: {
                // 所属对象id
                type: BIGINT,
                allowNull: false,
            },

            title: {
                // 内容
                type: STRING(256),
                defaultValue: '',
            },

            content: {
                // 内容
                type: TEXT,
                defaultValue: '',
            },

            state: {
                // 0 -- 进行中  1 -- 已完成
                type: INTEGER,
                defaultValue: 0,
            },

            tags: {
                type: STRING(256),
                defaultValue: '|',
            },

            assigns: {
                type: STRING(256),
                defaultValue: '|',
            },

            no: {
                // issue 序号
                type: INTEGER,
                defaultValue: 1,
            },

            text: {
                type: TEXT, // issue 搜索文本
            },

            extra: {
                type: JSON,
                defaultValue: {},
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',

            indexes: [
                {
                    unique: true,
                    fields: [ 'objectId', 'objectType', 'no' ],
                },
            ],
        }
    );

    model.afterCreate(async inst => {
        if (inst.objectType === ENTITY_TYPE_PROJECT) {
            // ISSUE创建  活跃度加1
            await app.model.contributions.addContributions(inst.userId);
        }
    });

    model.getById = async function(id, userId) {
        const where = { id };

        if (userId) where.userId = userId;

        const data = await app.model.issues.findOne({ where });

        return data && data.get({ plain: true });
    };

    model.getObjectStatistics = async function(objectId, objectType) {
        const sql =
            'select state, count(*) count from issues where objectId = :objectId and objectType = :objectType group by state';
        const list = await app.model.query(sql, {
            type: app.model.QueryTypes.SELECT,
            replacements: {
                objectId,
                objectType,
            },
        });

        return list;
    };

    model.getObjectIssues = async function(query, options = {}) {
        const result = await app.model.issues.findAndCountAll({
            ...options,
            where: query,
        });
        const issues = result.rows;
        const total = result.count;

        const userIds = [];

        _.each(issues, (val, index) => {
            val = val.get ? val.get({ plain: true }) : val;
            issues[index] = val;

            if (_.indexOf(userIds, val.userId) < 0) userIds.push(val.userId);

            const ids = val.assigns.split('|');
            val.assigns = [];
            _.each(ids, id => {
                id = id ? _.toNumber(id) : NaN;
                if (_.isNaN(id)) return;
                val.assigns.push(id);
                if (_.indexOf(userIds, id) < 0) userIds.push(id);
            });
        });

        const users = await app.model.users.findAll({
            attributes: USER_ATTRS,
            where: { id: { [app.Sequelize.Op.in]: userIds } },
        });

        const usermap = {};
        _.each(users, user => {
            user = user.get ? user.get({ plain: true }) : user;
            usermap[user.userId] = user;
        });

        _.each(issues, val => {
            val.user = usermap[val.userId];
            const assigns = val.assigns;
            val.assigns = [];
            _.each(assigns, id => val.assigns.push(usermap[id]));
        });

        return { issues, total };
    };

    model.getIssueAssigns = async function(assigns) {
        const ids = assigns.split('|').filter(o => o);
        const userIds = [];
        _.each(ids, id => {
            id = id ? _.toNumber(id) : NaN;
            if (_.isNaN(id)) return;
            if (_.indexOf(userIds, id) < 0) userIds.push(id);
        });

        const users = await app.model.users.findAll({
            attributes: USER_ATTRS,
            where: { id: { [app.Sequelize.Op.in]: userIds } },
        });

        _.each(
            users,
            (val, index) =>
                (users[index] = val.get ? val.get({ plain: true }) : val)
        );
        return users;
    };

    app.model.issues = model;

    model.associate = () => {
        app.model.issues.belongsTo(app.model.users, {
            as: 'users',
            foreignKey: 'userId',
            targetKey: 'id',
            constraints: false,
        });
    };
    return model;
};
