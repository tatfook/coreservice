'use strict';
const _ = require('lodash');
const {
    ENTITY_TYPE_USER,
    ENTITY_TYPE_SITE,
    ENTITY_TYPE_PROJECT,
} = require('../core/consts.js');

module.exports = app => {
    const { BIGINT, INTEGER, TEXT, JSON } = app.Sequelize;

    const model = app.model.define(
        'illegals',
        {
            id: {
                // id
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            objectId: {
                // 对象id
                type: BIGINT,
                defaultValue: 0,
            },

            objectType: {
                // 对象类型  0 - 用户 1 - 站点  5 - 项目
                type: INTEGER,
                defaultValue: 0,
            },

            handler: {
                // 操作者id 应为admin中的用户id
                type: BIGINT,
                defaultValue: 0,
            },

            description: {
                // 不合法原因
                type: TEXT,
                defaultValue: '',
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
                    fields: ['objectId', 'objectType'],
                },
            ],
        }
    );

    model.afterCreate(async (inst, options) => {
        // 封停
        const { objectId, objectType } = inst;
        const transaction = options.transaction;
        if (objectType === ENTITY_TYPE_USER) {
            const user = await app.model.users
                .findOne({ where: { id: objectId }, transaction })
                .then(o => o && o.toJSON());
            const projects = await app.model.projects
                .findAll({ where: { userId: objectId }, transaction })
                .then(list => _.map(list, o => o.toJSON()));
            await app.model.query(`call p_disable_user(${objectId})`, {
                transaction,
            });
            await app.api.es.deleteUser(user.id);
            for (let i = 0; i < projects.length; i++) {
                await app.api.es.deleteProject(projects[i].id);
            }
        } else if (objectType === ENTITY_TYPE_PROJECT) {
            const project = await app.model.projects
                .findOne({ where: { id: objectId }, transaction })
                .then(o => o && o.toJSON());
            await app.model.query(`call p_disable_project(${objectId})`, {
                transaction,
            });
            await app.api.es.deleteProject(project.id);
        } else if (objectType === ENTITY_TYPE_SITE) {
            await app.model.query(`call p_disable_site(${objectId})`, {
                transaction,
            });
        }
    });

    model.afterDestroy(async (inst, options) => {
        // 解封
        const { objectId, objectType } = inst;
        const transaction = options.transaction;
        if (objectType === ENTITY_TYPE_USER) {
            await app.model.query(`call p_enable_user(${objectId})`, {
                transaction,
            });
            const user = await app.model.users
                .findOne({ where: { id: objectId }, transaction })
                .then(o => o && o.toJSON());
            const projects = await app.model.projects
                .findAll({ where: { userId: objectId }, transaction })
                .then(list => _.map(list, o => o.toJSON()));
            await app.api.es.upsertUser(user, transaction);
            for (let i = 0; i < projects.length; i++) {
                await app.api.es.upsertProject(projects[i], transaction);
            }
        } else if (objectType === ENTITY_TYPE_PROJECT) {
            await app.model.query(`call p_enable_project(${objectId})`, {
                transaction,
            });
            const project = await app.model.projects
                .findOne({ where: { id: objectId }, transaction })
                .then(o => o && o.toJSON());
            await app.api.es.upsertProject(project, transaction);
        } else if (objectType === ENTITY_TYPE_SITE) {
            await app.model.query(`call p_enable_site(${objectId})`, {
                transaction,
            });
        }
    });

    app.model.illegals = model;

    model.associate = () => {
        app.model.illegals.belongsTo(app.model.users, {
            as: 'users',
            foreignKey: 'objectId',
            targetKey: 'id',
            constraints: false,
        });

        app.model.illegals.belongsTo(app.model.projects, {
            as: 'projects',
            foreignKey: 'objectId',
            targetKey: 'id',
            constraints: false,
        });

        app.model.illegals.belongsTo(app.model.sites, {
            as: 'sites',
            foreignKey: 'objectId',
            targetKey: 'id',
            constraints: false,
        });

        app.model.illegals.belongsTo(app.model.illegalUsers, {
            as: 'illegalUsers',
            foreignKey: 'objectId',
            targetKey: 'id',
            constraints: false,
        });

        app.model.illegals.belongsTo(app.model.illegalProjects, {
            as: 'illegalProjects',
            foreignKey: 'objectId',
            targetKey: 'id',
            constraints: false,
        });

        app.model.illegals.belongsTo(app.model.illegalSites, {
            as: 'illegalSites',
            foreignKey: 'objectId',
            targetKey: 'id',
            constraints: false,
        });
    };
    return model;
};
