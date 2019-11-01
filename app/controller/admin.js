'use strict';

const _ = require('lodash');
const Controller = require('../core/controller.js');
const joi = require('joi');
const Admin = class extends Controller {
    parseParams() {
        const params = this.validate();
        const resourceName = params.resources || '';
        delete params.resources;

        this.resource = this.ctx.model[resourceName];
        this.resourceName = resourceName;

        if (!this.resource) this.ctx.throw(400, 'args error');

        this.adminAuthenticated();

        return params;
    }

    async action() {
        const userId = this.ctx.state.admin.userId;
        const url = this.ctx.url;
        const data = this.validate();
        await this.model.adminActions.create({ userId, url, data });

        return;
    }

    async login() {
        const config = this.app.config.self;
        const util = this.app.util;
        let { username, password } = this.validate({
            username: 'string',
            password: 'string',
        });
        username = username.toLowerCase();

        let user = await this.model.admins.findOne({
            where: {
                [this.model.Op.or]: [
                    { username },
                    { cellphone: username },
                    { email: username },
                ],
                password: this.app.util.md5(password),
            },
        });

        if (!user) return this.fail(1);
        user = user.get({ plain: true });

        // eslint-disable-next-line no-magic-numbers
        const tokenExpire = 3600 * 24 * 1000;
        const token = util.jwt_encode(
            {
                userId: user.id,
                roleId: user.roleId,
                username: user.username,
            },
            config.adminSecret,
            tokenExpire
        );

        user.token = token;

        // this.action();

        return this.success(user);
    }

    async userToken() {
        this.adminAuthenticated();
        const { userId } = this.validate({ userId: 'number' });
        const user = await this.model.users
            .findOne({ where: { id: userId } })
            .then(o => o && o.toJSON());
        if (!user) return this.throw(400);
        const tokenExpire = 3600;
        const config = this.app.config.self;
        const token = this.app.util.jwt_encode(
            {
                userId: user.id,
                username: user.username,
            },
            config.secret,
            tokenExpire
        );

        // this.action();

        return this.success(token);
    }

    async query() {
        this.adminAuthenticated();

        const { sql, data } = this.validate({ sql: 'string' });
        const _sql = sql.toLowerCase();
        if (
            _sql.indexOf('select ') !== 0 ||
            _sql.indexOf(';') >= 0 ||
            _sql.indexOf('upsert ') >= 0 ||
            _sql.indexOf('drop ') >= 0 ||
            _sql.indexOf('update ') >= 0 ||
            _sql.indexOf('delete ') >= 0 ||
            _sql.indexOf('create ') >= 0 ||
            _sql.indexOf('show ') >= 0 ||
            _sql.indexOf('alter ') >= 0
        ) {
            return this.throw(404, 'sql 不合法');
        }

        const list = await this.model.query(sql, {
            type: this.model.QueryTypes.SELECT,
            replacements: data,
        });

        // this.action();

        return this.success(list);
    }

    async resourcesQuery() {
        this.adminAuthenticated();

        const query = this.parseParams();

        this.formatQuery(query);

        const list = await this.resource.findAndCount(query);

        // this.action();

        return this.success(list);
    }

    async search() {
        this.adminAuthenticated();

        const query = this.parseParams();

        this.formatQuery(query);

        const list = await this.resource.findAndCountAll({
            ...this.queryOptions,
            where: query,
        });

        // this.action();

        return this.success(list);
    }

    async index() {
        this.adminAuthenticated();

        const query = this.parseParams();

        this.formatQuery(query);

        const list = await this.resource
            .findAll({ ...this.queryOptions, where: query })
            .then(list => list.map(o => o.toJSON()));
        const resource = this.ctx.service.resource.getResourceByName(
            this.resourceName
        );
        if (resource && resource.buildList) await resource.buildList(list);

        // this.action();

        return this.success(list);
    }

    async show() {
        this.adminAuthenticated();

        const params = this.parseParams();
        const id = _.toNumber(params.id);

        if (!id) this.throw(400, 'args error');

        const data = await this.resource.findOne({ where: { id } });

        // this.action();

        return this.success(data);
    }

    async bulkCreate() {
        this.adminAuthenticated();

        const { datas } = this.parseParams();

        const data = await this.resource.bulkCreate(datas);

        this.action();

        return this.success(data);
    }

    async bulkUpdate() {
        this.adminAuthenticated();

        const { data, query, datas = [] } = this.parseParams();

        await this.resource.update(data, { where: query });
        for (let i = 0; i < datas.length; i++) {
            if (!datas[i].id) continue;
            await this.resource.update(datas[i], {
                where: { id: datas[i].id },
            });
        }

        this.action();

        return this.success(data);
    }

    async bulkDestroy() {
        this.adminAuthenticated();

        const { query, datas = [] } = this.parseParams();

        const data = await this.resource.destroy({ where: query });
        for (let i = 0; i < datas.length; i++) {
            if (!datas[i].id) continue;
            await this.resource.destroy({ where: { id: datas[i].id } });
        }

        this.action();

        return this.success(data);
    }

    async create() {
        this.adminAuthenticated();

        const params = this.parseParams();
        const resource = this.ctx.service.resource.getResourceByName(
            this.resourceName
        );
        if (resource && resource.build) await resource.build(params);

        const data = await this.resource.create(params);

        if (resource && resource.afterCreate) {
            await resource.afterCreate({ ...params, id: data.id });
        }

        this.action();

        return this.success(data);
    }

    async update() {
        this.adminAuthenticated();

        const params = this.parseParams();
        const id = _.toNumber(params.id);
        const resource = this.ctx.service.resource.getResourceByName(
            this.resourceName
        );

        if (!id) this.throw(400, 'args error');

        params.id = id;
        const data = await this.resource.update(params, {
            where: { id },
            silent: true,
        });

        if (resource && resource.afterUpdate) {
            await resource.afterUpdate(params);
        }

        this.action();

        return this.success(data);
    }

    async destroy() {
        this.adminAuthenticated();

        const params = this.parseParams();
        const id = _.toNumber(params.id);

        if (!id) this.throw(400, 'args error');

        const data = await this.resource.destroy({ where: { id } });

        this.action();

        return this.success(data);
    }

    async createProjectTags() {
        this.adminAuthenticated();
        const { tags, projectId } = this.validate({
            tags: joi
                .array()
                .items(
                    joi.object({
                        tagId: joi
                            .number()
                            .integer()
                            .required()
                            .description('标签的ID'),
                        sn: joi
                            .number()
                            .integer()
                            .optional()
                            .description('该项目在此标签下的顺序'),
                    })
                )
                .required(),
            projectId: joi
                .number()
                .integer()
                .required()
                .description('待增加标签的项目ID'),
        });
        const result = await this.service.systemTagProject.createProjectTags(
            projectId,
            tags
        );
        this.action();

        return this.success(result);
    }

    async updateProjectTag() {
        this.adminAuthenticated();
        const { tagId, projectId, sn } = this.validate({
            tagId: joi
                .number()
                .integer()
                .required()
                .description('标签的ID'),
            projectId: joi
                .number()
                .integer()
                .required()
                .description('待增加标签的项目ID'),
            sn: joi
                .number()
                .integer()
                .required()
                .description('该项目在此标签下的顺序'),
        });
        const result = await this.service.systemTagProject.updateProjectTag(
            projectId,
            tagId,
            sn
        );
        this.action();

        return this.success(result);
    }

    async deleteProjectTags() {
        this.adminAuthenticated();
        const { tagIds, projectId } = this.validate({
            tagIds: joi
                .array()
                .items(
                    joi
                        .number()
                        .integer()
                        .description('tagId的数组')
                )
                .required(),
            projectId: joi
                .number()
                .integer()
                .required()
                .description('待增加标签的项目ID'),
        });
        const result = await this.service.systemTagProject.deleteProjectTags(
            projectId,
            tagIds
        );
        this.action();

        return this.success(result);
    }
};

module.exports = Admin;
