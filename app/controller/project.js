/* eslint-disable no-magic-numbers */
'use strict';

const _ = require('lodash');
const joi = require('joi');

const {
    ENTITY_TYPE_PROJECT,

    ENTITY_VISIBILITY_PUBLIC,
    PROJECT_TYPE_PARACRAFT,
} = require('../core/consts.js');
const Controller = require('../core/controller.js');

const Project = class extends Controller {
    get modelName() {
        return 'projects';
    }

    async setProjectUser(list) {
        const userIds = [];

        _.each(list, (o, i) => {
            o = o.get ? o.get({ plain: true }) : o;
            userIds.push(o.userId);
            list[i] = o;
        });

        const users = await this.model.users.getUsers(userIds);

        _.each(list, o => {
            o.user = users[o.userId];
        });
    }
    // TODO 该接口会将所有库中所有项目返回
    async search() {
        const model = this.model[this.modelName];
        const query = this.validate();

        this.formatQuery(query);

        const result = await model.findAndCountAll({
            ...this.queryOptions,
            where: query,
        });
        const rows = result.rows;

        await this.setProjectUser(rows);

        return this.success(result);
    }

    async searchForParacraft() {
        const { tagIds, sortTag, projectId, projectIds } = this.validate({
            tagIds: joi
                .array()
                .items(joi.number().integer())
                .required()
                .description('系统标签数组'),
            sortTag: joi
                .number()
                .integer()
                .optional()
                .description('要排序标签的ID'),
            projectId: joi
                .number()
                .integer()
                .optional()
                .description('要搜索的项目ID'),
            projectIds: joi
                .array()
                .items(joi.number().integer())
                .optional()
                .description('要搜索的项目ID数组'),
        });
        const result = await this.service.project.searchForParacraft(
            this.queryOptions,
            tagIds,
            sortTag,
            projectId,
            projectIds
        );
        const rows = result.rows;

        await this.setProjectUser(rows);

        return this.success(result);
    }

    async join() {
        const authUserId = this.getUser().userId;
        let { userId, exclude } = this.validate({
            userId: 'int_optional',
            exclude: 'boolean_optional',
        });
        if (!authUserId && !userId) return this.throw(400, '参数错误');
        userId = userId || authUserId;
        let list = await this.model.projects.getJoinProjects(
            userId,
            undefined,
            exclude
        );
        const projects = authUserId
            ? await this.model.members.findAll({
                  where: {
                      userId: authUserId,
                      objectType: ENTITY_TYPE_PROJECT,
                  },
              })
            : [];
        list = _.filter(list, o => {
            if (
                o.visibility === ENTITY_VISIBILITY_PUBLIC ||
                userId === authUserId
            ) {
                return true;
            }
            const index = _.findIndex(projects, t => t.objectId === o.id);
            return !(index < 0);
        });

        await this.setProjectUser(list);

        return this.success(list);
    }

    async index() {
        const authUserId = this.getUser().userId;
        const params = this.validate();
        if (!params.userId && !authUserId) return this.throw(400, '参数错误');
        params.userId = params.userId || authUserId;
        this.formatQuery(params);
        let list = await this.model.projects.findAll({
            ...this.queryOptions,
            where: params,
        });
        const projects = authUserId
            ? await this.model.members.findAll({
                  where: {
                      userId: authUserId,
                      objectType: ENTITY_TYPE_PROJECT,
                  },
              })
            : [];
        list = _.filter(list, o => {
            if (
                o.visibility === ENTITY_VISIBILITY_PUBLIC ||
                authUserId === params.userId
            ) {
                return true;
            }
            const index = _.findIndex(projects, t => t.objectId === o.id);
            return !(index < 0);
        });

        await this.setProjectUser(list);
        return this.success(list);
    }

    async create() {
        const { ctx, service } = this;
        const userId = this.authenticated().userId;
        const params = await this.ctx.validate(
            this.app.validator.project.createBody,
            this.getParams()
        );
        params.userId = userId;
        // params.status = params.type == PROJECT_TYPE_PARACRAFT ? 1 : 2; // 1 - 创建中  2 - 创建完成
        delete params.star;
        delete params.stars;
        delete params.visit;
        delete params.hotNo;
        delete params.choicenessNo;
        delete params.rate;
        delete params.rateCount;
        delete params.classifyTags;
        const transaction = await ctx.model.transaction();
        try {
            const project = await ctx.model.projects.create(params, {
                transaction,
            });
            // 将创建者加到自己项目的成员列表中
            await this.model.members.create(
                {
                    userId,
                    memberId: userId,
                    objectType: ENTITY_TYPE_PROJECT,
                    objectId: project.id,
                },
                { transaction }
            );
            if (params.type === PROJECT_TYPE_PARACRAFT) {
                // 判断有无超限制
                const worldLimit = await service.user.getUserWorldLimit(userId);
                if (
                    worldLimit.world !== -1 &&
                    worldLimit.usedWorld >= worldLimit.world
                ) {
                    await transaction.rollback();
                    return this.fail(17);
                }
                await service.world.createWorldByProject(project, transaction);
            }
            await transaction.commit();
            return this.success(project);
        } catch (e) {
            ctx.logger.error(e);
            await transaction.rollback();
            return this.fail(9);
        }
    }

    async destroy() {
        const { ctx, service } = this;
        const { userId } = this.authenticated();
        const { id } = this.validate({ id: 'int' });

        const project = await this.model.projects.getById(id, userId);
        if (!project) return this.success('OK');

        const transaction = await ctx.model.transaction();
        try {
            if (project.type === PROJECT_TYPE_PARACRAFT) {
                await service.world.destroyWorldByProject(project, transaction);
            }
            // 前面已确保项目是属于自己的
            await this.model.favorites.destroy({
                where: { objectId: id, objectType: ENTITY_TYPE_PROJECT },
                transaction,
            });
            await this.model.comments.destroy({
                where: { objectId: id, objectType: ENTITY_TYPE_PROJECT },
                transaction,
            });
            await this.model.issues.destroy({
                where: { objectId: id, objectType: ENTITY_TYPE_PROJECT },
                transaction,
            });
            await this.model.projects.destroy({
                where: { id: project.id },
                transaction,
                individualHooks: true,
            });
            await transaction.commit();
            return this.success();
        } catch (e) {
            ctx.logger.error(e);
            await transaction.rollback();
            return this.fail(18);
        }
    }

    async update() {
        const userId = this.authenticated().userId;
        const params = this.validate({ id: 'int' });
        const id = params.id;

        delete params.userId;
        delete params.star;
        delete params.stars;
        delete params.visit;
        delete params.hotNo;
        delete params.choicenessNo;
        delete params.rate;
        delete params.rateCount;
        delete params.classifyTags;

        const transaction = await this.model.transaction();
        let data;
        try {
            await this.model.projects.update(params, {
                where: { id, userId },
                transaction,
                individualHooks: true,
            });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }

        // 更新world的worldTagName
        if (params.extra && params.extra.worldTagName) {
            const world = await this.model.worlds.findOne({
                where: {
                    projectId: id,
                    userId,
                },
            });
            if (world) {
                const extra = world.extra ? world.extra : {};
                extra.worldTagName = params.extra.worldTagName;
                await this.model.worlds.update(
                    {
                        extra,
                    },
                    {
                        where: {
                            id: world.id,
                        },
                    }
                );
            }
        }
        return this.success(data);
    }
    // TODO 存在刷访问量的风险
    async visit() {
        const { id } = this.validate({ id: 'int' });

        const project = await this.model.projects.getById(id);

        if (!project) return this.throw(404);

        await this.model.projects.statistics(id, 1, 0, 0);

        return this.success(project);
    }

    async isStar() {
        const { userId } = this.authenticated();
        const { id } = this.validate({ id: 'int' });

        const project = await this.model.projects.getById(id);
        if (!project) return this.throw(404);

        const index = _.findIndex(project.stars, id => id === userId);

        return this.success(!(index < 0));
    }

    async star() {
        const { userId } = this.authenticated();
        const { id } = this.validate({ id: 'int' });

        const project = await this.model.projects.getById(id);
        if (!project) return this.throw(404);

        project.stars = project.stars || [];
        const index = _.findIndex(project.stars, id => id === userId);
        if (index >= 0) return this.success(project);

        project.stars.push(userId);

        const transaction = await this.model.transaction();
        try {
            await this.model.projects.update(project, {
                fields: ['stars'],
                where: { id },
                transaction,
                individualHooks: true,
            });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }

        await this.model.projects.statistics(id, 0, 1, 0);

        return this.success(project);
    }

    async unstar() {
        const { userId } = this.authenticated();
        const { id } = this.validate({ id: 'int' });

        const project = await this.model.projects.getById(id);
        if (!project) return this.throw(404);

        project.stars = project.stars || [];
        const index = _.findIndex(project.stars, id => id === userId);
        if (index < 0) return this.success(project);
        project.stars.splice(index, 1);
        const transaction = await this.model.transaction();
        try {
            await this.model.projects.update(project, {
                fields: ['stars'],
                where: { id },
                transaction,
                individualHooks: true,
            });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
        await this.model.projects.statistics(id, 0, -1, 0);

        return this.success(project);
    }

    async detail() {
        const { id } = this.validate({ id: 'int' });

        const project = await this.model.projects.getById(id);
        if (!project) return this.throw(404);

        project.favoriteCount = await this.model.favorites.objectCount(
            project.id,
            ENTITY_TYPE_PROJECT
        );
        if (project.type === PROJECT_TYPE_PARACRAFT) {
            project.world = await this.model.worlds.getByProjectId(project.id);
            const user = await this.model.users.findOne({
                where: { id: project.userId },
            });
            if (user) project.username = user.username;
        }

        return this.success(project);
    }

    // 获取项目参加的赛事
    async game() {
        const { id } = this.validate({ id: 'int' });
        const curdate = new Date();
        const Op = this.app.Sequelize.Op;
        // TODO startDate 字符串类型？？
        const game = await this.model.games
            .findOne({
                include: [
                    {
                        as: 'gameWorks',
                        model: this.model.gameWorks,
                        where: {
                            projectId: id,
                        },
                    },
                ],
                where: {
                    startDate: { [Op.lte]: curdate },
                    endDate: { [Op.gte]: curdate },
                },
            })
            .then(o => o && o.toJSON());

        if (!game) return this.throw(404);

        return this.success(game);
    }
    // 大家都觉得赞 #5946
    async mostStar() {
        const { offset, limit } = this.queryOptions;
        const result = await this.service.project.getMostStar(offset, limit);
        const rows = result.rows;

        await this.setProjectUser(rows);

        return this.success(result);
    }
};

module.exports = Project;
