'use strict';

const _ = require('lodash');
const { ENTITY_TYPE_PROJECT } = require('../../core/consts.js');
const DataLoader = require('dataloader');

class ProjectConnector {
    constructor(ctx) {
        this.ctx = ctx;
        this.model = ctx.app.model;
        this.loader = new DataLoader(this.fetch.bind(this));
        this.loaderWorldByProjectId = new DataLoader(keys =>
            this.model.worlds
                .findAll({
                    where: {
                        projectId: { [this.ctx.app.Sequelize.Op.in]: keys },
                    },
                })
                .then(arr => arr.map(o => o.toJSON()))
        );
    }

    fetch(ids) {
        const users = this.ctx.app.model.projects
            .findAll({
                where: {
                    id: {
                        $in: ids,
                    },
                },
            })
            .then(us => us.map(u => u.toJSON()));
        return users;
    }

    fetchByIds(ids) {
        return this.loader.loadMany(ids);
    }

    fetchById(id) {
        return this.loader.load(id);
    }

    async fetchByUserId(userId) {
        const authUserId = this.ctx.state.user.userId;

        if (!authUserId) {
            return await this.model.projects
                .findAll({ where: { userId, visibility: 0 } })
                .then(list => _.map(list, o => o.toJSON()));
        } else if (authUserId === userId) {
            return await this.model.projects
                .findAll({ where: { userId } })
                .then(list => _.map(list, o => o.toJSON()));
        }

        const sql =
            // eslint-disable-next-line max-len
            'select * from projects where userId = :userId and (visibility  = 0 or (visibility = 1 and id in (select objectId from members where memberId = :authUserId and objectType = :objectType and userId = :userId)))';
        return await this.model.query(sql, {
            type: this.model.QueryTypes.SELECT,
            replacements: {
                authUserId,
                objectType: ENTITY_TYPE_PROJECT,
                userId,
            },
        });
    }

    async fetchJoinByUserId(userId) {
        const authUserId = this.ctx.state.user.userId;
        const objectIds = await this.model.query(
            'select objectId from members where objectType = :objectType and memberId = :userId and userId != :userId',
            {
                type: this.model.QueryTypes.SELECT,
                replacements: {
                    objectType: ENTITY_TYPE_PROJECT,
                    userId,
                },
            }
        );

        if (objectIds.length === 0) return [];

        const sql =
            // eslint-disable-next-line max-len
            'select * from projects where id in (:objectIds) and (visibility = 0 or (visibility = 1 and id in (select objectId from members where memberId = :authUserId and objectType = :objectType and objectId in (:objectIds))))';
        return await this.model.query(sql, {
            type: this.model.QueryTypes.SELECT,
            replacements: {
                objectType: ENTITY_TYPE_PROJECT,
                authUserId,
                userId,
                objectIds,
            },
        });
    }

    async fetchWorldByProjectId(projectId) {
        return this.loaderWorldByProjectId.load(projectId);
    }
}

module.exports = ProjectConnector;
