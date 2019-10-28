/* eslint-disable no-magic-numbers */
'use strict';
const _ = require('lodash');
// const Service = require('egg').Service;
const Service = require('../core/service.js');

class Project extends Service {
    // 项目评分
    async rate(projectId, rate) {
        if (!projectId) return;
        const project = await this.app.model.projects.getById(projectId);
        if (!project) return;
        const type = this.app.model.QueryTypes.SELECT;
        const projectsAvgRate = 70;
        const arr = await this.app.model.query(
            'select avg(rate) as avgrate, count(*) as count from projectRates where projectId = :projectId',
            { type, replacements: { projectId } }
        );
        if (arr.length !== 1) return;
        const projectAvgRate = _.toNumber(arr[0].avgrate);
        const projectRateCount = _.toNumber(arr[0].count);
        const rateThreshold = 20;
        const projectRate =
            projectRateCount < 8
                ? 0
                : (projectRateCount / (projectRateCount + rateThreshold)) *
                      projectAvgRate +
                  (rateThreshold / (projectRateCount + rateThreshold)) *
                      projectsAvgRate;

        const extra = project.extra || {};
        extra.rate = extra.rate || {};
        const rateLevel = _.floor(rate / 20);
        extra.rate[rateLevel] = (extra.rate[rateLevel] || 0) + 1;
        extra.rate.count = projectRateCount;

        await this.app.model.projects.update(
            { rate: projectRate, rateCount: projectRateCount, extra },
            { where: { id: projectId } }
        );

        project.rate = projectRate;
        project.extra = extra;

        this.app.api.projectsUpsert(project);
        return;
    }

    // 作品评分
    async worksRate(projectId) {
        const curdate = new Date();
        const Op = this.app.Sequelize.Op;
        const game = await this.model.games
            .findOne({
                include: [
                    {
                        as: 'gameWorks',
                        model: this.model.gameWorks,
                        where: {
                            projectId,
                        },
                    },
                ],
                where: {
                    startDate: { [Op.lte]: curdate },
                    endDate: { [Op.gte]: curdate },
                },
            })
            .then(o => o && o.toJSON());
        if (!game) return;
        const worksId = game.gameWorks.id;
        const startDate = game.startDate;
        const endDate = game.endDate;
        const type = this.app.model.QueryTypes.SELECT;
        const projectsAvgRate = 70;
        const arr = await this.app.model.query(
            // eslint-disable-next-line max-len
            'select avg(rate) as avgrate, count(*) as count from projectRates where projectId = :projectId and createdAt >= :startDate and createdAt <= :endDate',
            { type, replacements: { projectId, startDate, endDate } }
        );
        if (arr.length !== 1) return;
        const projectAvgRate = _.toNumber(arr[0].avgrate);
        const projectRateCount = _.toNumber(arr[0].count);
        const rateThreshold = 20;
        const projectRate =
            projectRateCount < 8
                ? 0
                : (projectRateCount / (projectRateCount + rateThreshold)) *
                      projectAvgRate +
                  (rateThreshold / (projectRateCount + rateThreshold)) *
                      projectsAvgRate;
        await this.app.model.gameWorks.update(
            { worksRate: projectRate, worksRateCount: projectRateCount },
            { where: { id: worksId } }
        );
        return;
    }

    // paracraft项目搜索
    async searchForParacraft(queryOptions, tagIds, sortTag, projectId) {
        const whereClause = [];
        if (projectId) {
            whereClause.push({ id: projectId });
        }
        const includeWhere = {};
        if (sortTag) {
            includeWhere.id = sortTag;
        }
        const idsSet = new Set(tagIds);
        idsSet.delete(sortTag);
        idsSet.forEach(id => {
            whereClause.push({
                id: {
                    [this.app.Sequelize.Op.in]: this.app.Sequelize.literal(
                        `(SELECT a.id FROM projects a, systemTagProjects b where a.id = b.projectId and b.systemTagId=${id})`
                    ),
                },
            });
        });
        const result = await this.model.projects.findAndCountAll({
            ...queryOptions,
            where: {
                [this.app.Sequelize.Op.and]: whereClause,
            },
            include: [
                {
                    model: this.model.systemTags,
                    nested: false,
                    where: includeWhere,
                },
            ],
            order: [
                [
                    this.model.systemTags,
                    this.model.systemTagProjects,
                    'sn',
                    'desc',
                ],
            ],
            distinct: true,
        });
        return result;
    }
}

module.exports = Project;
