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

        const transaction = await this.model.transaction();
        try {
            await this.app.model.projects.update(
                { rate: projectRate, rateCount: projectRateCount, extra },
                { where: { id: projectId }, transaction, individualHooks: true }
            );
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }

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
    async searchForParacraft(
        queryOptions,
        tagIds,
        sortTag,
        projectId,
        projectIds = []
    ) {
        const whereClause = [];
        if (projectId) {
            whereClause.push({ id: projectId });
        }
        if (projectIds.length) {
            whereClause.push({
                id: {
                    [this.app.Sequelize.Op.in]: projectIds,
                },
            });
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
            where: {
                [this.app.Sequelize.Op.and]: whereClause,
            },
            include: [
                {
                    model: this.model.systemTags,
                    nested: false,
                    as: 'systemTags',
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
                [ 'id', 'asc' ],
            ],
            distinct: true,
        });
        // 数据量不多，sequelize分页有问题，使用本地分页
        result.rows = result.rows.slice(
            queryOptions.offset,
            queryOptions.limit + queryOptions.offset
        );
        return result;
    }

    async esProjectWorldTagNameUpdate() {
        const projects = await this.app.model.query(
            `SELECT 
        a.id
    FROM
        projects a,
        worlds b
    WHERE
        a.id = b.projectId
            AND ISNULL(a.extra) = 0
            AND LENGTH(TRIM(JSON_EXTRACT(a.extra, '$.worldTagName'))) != 0;`,
            { type: this.model.QueryTypes.SELECT }
        );
        const promises = projects.map(project => {
            return async function() {
                const _project = await this.app.model.projects.findOne({
                    where: { id: project.id },
                    include: [
                        {
                            model: this.app.model.systemTags,
                            as: 'systemTags',
                        },
                    ],
                });
                if (_project) {
                    return await this.app.api.es.upsertProject(_project);
                }
            };
        });
        return await Promise.all(promises);
    }
    /**
     * 大家都觉得赞，只取8个
     * @param {Number} offset 分页
     * @param {Number} limit 分页
     * @return {Promise<{rows, count}>} 返回值
     */
    async getMostStar(offset, limit) {
        const countSql = `
        SELECT 
            COUNT(*) as count
        FROM
            projects a
                JOIN
            users b ON a.userId = b.id
                AND b.realname IS NOT NULL;`;
        const [{ count }] = await this.app.model.query(countSql, {
            type: this.app.model.QueryTypes.SELECT,
        });
        const rowsSql = `
        (SELECT 
            a.*
        FROM
            projects a
                JOIN
            users b ON a.userId = b.id AND lastStar > 0
                AND b.realname IS NOT NULL
        WHERE
            a.updatedAt > DATE_SUB(NOW(), INTERVAL 1 WEEK)
        ORDER BY a.lastStar DESC limit ?,?) UNION (SELECT 
           a.*
        FROM
            projects a
                JOIN
            users b ON a.userId = b.id 
                AND b.realname IS NOT NULL
        WHERE
            a.updatedAt <= DATE_SUB(NOW(), INTERVAL 1 WEEK)
        ORDER BY a.star DESC, a.updatedAt desc limit ?,?);`;
        let rows = await this.app.model.query(rowsSql, {
            replacements: [ offset, limit, offset, limit ],
            type: this.app.model.QueryTypes.SELECT,
        });
        rows = rows.slice(0, 8);
        return {
            count,
            rows,
        };
    }
}

module.exports = Project;
