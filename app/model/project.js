/* eslint-disable no-magic-numbers */
'use strict';
const { ENTITY_TYPE_PROJECT } = require('../core/consts.js');

module.exports = app => {
    const { BIGINT, INTEGER, STRING, FLOAT, TEXT, JSON } = app.Sequelize;

    const attrs = {
        id: {
            type: BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },

        userId: {
            // 拥有者
            type: BIGINT,
            allowNull: false,
        },

        name: {
            // 项目名称
            type: STRING(255),
            allowNull: false,
        },

        siteId: {
            // 站点Id
            type: BIGINT,
        },

        status: {
            // 项目状态  0 -- 创建失败  1  -- 创建中   2 --  创建成功
            type: INTEGER,
            defaultValue: 0,
        },

        visibility: {
            // 可见性 0 - 公开 1 - 私有
            type: INTEGER,
            defaultValue: 0,
        },

        privilege: {
            // 权限
            type: INTEGER,
            defaultValue: 0,
        },

        type: {
            // 评论对象类型  0 -- paracrfat  1 -- 网站
            type: INTEGER,
            allowNull: false,
            defaultValue: 1,
        },

        tags: {
            // 项目tags
            type: STRING(255),
            defaultValue: '|',
        },

        visit: {
            // 访问量
            type: INTEGER,
            defaultValue: 0,
        },

        star: {
            // 点赞数量
            type: INTEGER,
            defaultValue: 0,
        },

        favorite: {
            // 收藏量
            type: INTEGER,
            defaultValue: 0,
        },

        comment: {
            // 评论数量
            type: INTEGER,
            defaultValue: 0,
        },

        lastVisit: {
            // 最近访问量
            type: INTEGER,
            defaultValue: 0,
        },

        lastStar: {
            // 最近点赞数量
            type: INTEGER,
            defaultValue: 0,
        },

        lastComment: {
            // 最近评论数量
            type: INTEGER,
            defaultValue: 0,
        },

        stars: {
            // 点赞用户id 列表
            type: JSON,
            defaultValue: [],
        },

        hotNo: {
            type: INTEGER, // 热门编号
            defaultValue: 0,
        },

        choicenessNo: {
            // 精选编号
            type: INTEGER,
            defaultValue: 0,
        },

        description: {
            // 项目描述
            type: TEXT,
            defaultValue: '',
        },

        rate: {
            // 项目评分
            type: FLOAT,
            defaultValue: 0,
        },

        rateCount: {
            // 项目评分人数
            type: INTEGER,
            defaultValue: 0,
        },

        classifyTags: {
            // 系统分类tags
            type: STRING(255),
            defaultValue: '|',
        },

        extend: {
            // 后端使用
            type: JSON,
            defaultValue: {},
        },

        extra: {
            // 前端使用
            type: JSON,
            defaultValue: {},
        },
    };

    const opts = {
        underscored: false,
        charset: 'utf8mb4',
        collate: 'utf8mb4_bin',
        indexes: [
            {
                unique: true,
                fields: [ 'userId', 'name' ],
            },
        ],
    };
    app.model.illegalProjects = app.model.define(
        'illegalProjects',
        attrs,
        opts
    );

    app.model.illegalProjects.associate = () => {
        app.model.illegalProjects.hasOne(app.model.illegals, {
            as: 'illegals',
            foreignKey: 'objectId',
            constraints: false,
        });
    };
    const model = app.model.define('projects', attrs, opts);

    async function __hook__(inst, options) {
        const { userId } = inst;
        const transaction = options.transaction;
        const count = await app.model.projects.count({
            where: { userId },
            transaction,
        });
        await app.model.userRanks.update(
            { project: count },
            { where: { userId }, transaction }
        );
        const user = await app.model.users.getById(userId, transaction);
        await app.api.es.upsertUser(user, transaction);
    }

    model.afterCreate(async (inst, options) => {
        await __hook__(inst, options);
        await app.api.es.upsertProject(inst);
    });

    model.afterUpdate(async (inst, options) => {
        await __hook__(inst, options);
        await app.api.es.upsertProject(inst);
    });

    model.afterDestroy(async (inst, options) => {
        await __hook__(inst, options);
        await app.api.es.deleteProject(inst.id);
    });

    model.getById = async function(id, userId) {
        const where = { id };

        if (userId) where.userId = userId;

        const data = await app.model.projects.findOne({ where });

        return data && data.get({ plain: true });
    };

    model.getJoinProjects = async function(userId, visibility, exclude) {
        let sql = `select projects.* from projects, members where 
			members.memberId = :memberId and projects.id = members.objectId 
			and objectType = :objectType`;
        if (visibility !== undefined) {
            sql += ' and projects.visibility = :visibility';
        }
        if (exclude) sql += ' and projects.userId != :memberId';

        const list = app.model.query(sql, {
            type: app.model.QueryTypes.SELECT,
            replacements: {
                memberId: userId,
                objectType: ENTITY_TYPE_PROJECT,
                visibility,
            },
        });

        return list;
    };

    model.statistics = async function(id, visit, star, comment) {
        const project = await this.getById(id);
        if (!project) return;

        const data = project.extend || {};
        const statistics = data.statistics || {};
        const { year, month, day } = app.util.getDate();
        const curTime = new Date(year, month, day).getTime();
        const dayTime = 1000 * 3600 * 24;
        const newStatistics = {};
        for (let i = 0; i < 7; i++) {
            newStatistics[curTime - i * dayTime] = statistics[
                curTime - i * dayTime
            ] || { visit: 0, star: 0, comment: 0 };
        }
        newStatistics[curTime].visit += visit;
        newStatistics[curTime].star += star;
        newStatistics[curTime].comment += comment;
        project.visit += visit;
        project.star += star;
        project.comment += comment;
        project.lastVisit = 0;
        project.lastStar = 0;
        project.lastComment = 0;

        for (let i = 0; i < 7; i++) {
            project.lastVisit += newStatistics[curTime - i * dayTime].visit;
            project.lastStar += newStatistics[curTime - i * dayTime].star;
            project.lastComment += newStatistics[curTime - i * dayTime].comment;
        }

        data.statistics = newStatistics;
        project.extend = data;
        const transaction = await app.model.transaction();
        try {
            await app.model.projects.update(project, {
                where: { id },
                silent: true,
                transaction,
                individualHooks: true,
            });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }

        return;
    };

    model.commentCreateHook = async function(id) {
        await this.statistics(id, 0, 0, 1);
    };

    model.commentDestroyHook = async function(id) {
        await this.statistics(id, 0, 0, -1);
    };

    app.model.projects = model;

    model.associate = () => {
        app.model.projects.hasOne(app.model.illegals, {
            as: 'illegals',
            foreignKey: 'objectId',
            constraints: false,
        });

        app.model.projects.hasMany(app.model.favorites, {
            as: 'favorites',
            foreignKey: 'objectId',
            sourceKey: 'id',
            constraints: false,
        });

        app.model.projects.belongsTo(app.model.users, {
            as: 'users',
            foreignKey: 'userId',
            targetKey: 'id',
            constraints: false,
        });

        app.model.projects.belongsToMany(app.model.systemTags, {
            through: {
                model: app.model.systemTagProjects,
            },
            as: 'systemTags',
            foreignKey: 'projectId',
            constraints: false,
        });

        app.model.projects.belongsToMany(app.model.systemTags, {
            through: {
                model: app.model.systemTagProjects,
            },
            as: 'filterTags',
            foreignKey: 'projectId',
        });

        app.model.projects.hasOne(app.model.gameWorks, {
            as: 'gameWorks',
            foreignKey: 'projectId',
            sourceKey: 'id',
            constraints: false,
        });
    };
    return model;
};
