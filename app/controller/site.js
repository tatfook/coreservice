'use strict';
const joi = require('joi');
const _ = require('lodash');

const Controller = require('../core/controller.js');
const consts = require('../core/consts.js');

const {
    USER_ACCESS_LEVEL_NONE,
    USER_ACCESS_LEVEL_READ,
    USER_ACCESS_LEVEL_WRITE,
} = consts;

const Site = class extends Controller {
    get modelName() {
        return 'sites';
    }

    async index() {
        const { userId, username } = this.authenticated();
        const params = this.validate({
            owned: 'boolean_optional',
            membership: 'boolean_optional',
        });

        let list = [];
        params.owned = params.owned === undefined;
        if (params.owned) {
            const sites = await this.model.sites.get(userId);
            _.each(sites, site => {
                site.username = username;
            });
            list = list.concat(sites);
        }

        if (params.membership) {
            list = list.concat(
                await this.model.sites.getJoinSites(
                    userId,
                    USER_ACCESS_LEVEL_WRITE
                )
            );
        }

        return this.success(list);
    }

    async show() {
        const { id } = this.validate({ id: 'int' });

        const site = await this.model.sites.getById(id);

        return this.success(site);
    }

    async create() {
        const { ctx } = this;
        const { userId, username } = this.authenticated();
        const params = this.validate({
            sitename: 'string',
        });

        params.userId = userId;
        params.username = username;
        const data = await ctx.service.site.createSite(params);

        return this.success(data);
    }

    async update() {
        const model = this.model;
        const userId = this.authenticated().userId;
        const params = this.validate({ id: 'int' });
        const id = params.id;

        const site = await model.sites.getById(id, userId);
        const user = await model.users.getById(userId);
        if (!user || !site) this.throw(400);
        site.username = user.username;

        const data = await model.sites.update(params, {
            where: { id, userId },
        });
        return this.success(data);
    }

    async updateVisibility() {
        const userId = this.authenticated().userId;
        const { id, visibility } = this.validate({
            id: 'int',
            visibility: 'int',
        });
        await this.service.site.updateVisiblity(id, userId, visibility);
        return this.success();
    }

    async destroy() {
        const userId = this.authenticated().userId;
        const { id } = this.validate({ id: 'int' });

        await this.ctx.service.site.destroySite(id, userId);
        return this.success();
    }

    async getJoinSites() {
        const { model } = this;
        const userId = this.authenticated().userId;

        const list = await model.sites.getJoinSites(userId);

        return this.success(list);
    }

    async postGroups() {
        const userId = this.authenticated().userId;
        const params = this.validate({
            id: 'int',
            groupId: 'int',
            level: joi
                .number()
                .valid(
                    USER_ACCESS_LEVEL_NONE,
                    USER_ACCESS_LEVEL_READ,
                    USER_ACCESS_LEVEL_WRITE
                ),
        });

        const site = await this.model.sites.getById(params.id, userId);
        if (!site) this.throw(400, '用户站点不存在');
        const group = await this.model.groups.getById(params.groupId, userId);
        if (!group) this.throw(400, '用户组不存在');

        const data = await this.model.siteGroups.create({
            userId,
            siteId: params.id,
            groupId: params.groupId,
            level: params.level,
        });
        if (!data) this.throw(500, 'DB Error');

        this.success(data.get({ plain: true }));
    }

    async putGroups() {
        const userId = this.authenticated().userId;
        const params = this.validate({
            id: 'int',
            groupId: 'int',
            level: joi
                .number()
                .valid(
                    USER_ACCESS_LEVEL_NONE,
                    USER_ACCESS_LEVEL_READ,
                    USER_ACCESS_LEVEL_WRITE
                ),
        });

        const where = {
            userId,
            siteId: params.id,
            groupId: params.groupId,
        };
        const data = await this.model.siteGroups.update(
            { level: params.level },
            { where }
        );

        this.success(data);
    }

    async deleteGroups() {
        const userId = this.authenticated().userId;
        const params = this.validate({
            id: 'int',
            groupId: 'int',
        });

        const data = await this.model.siteGroups.destroy({
            where: {
                userId,
                siteId: params.id,
                groupId: params.groupId,
            },
        });

        this.success(data);
    }

    async getGroups() {
        const userId = this.authenticated().userId;
        const siteId = this.validate({ id: 'int' }).id;

        const list = await this.model.sites.getSiteGroups(userId, siteId);

        return this.success(list);
    }

    async privilege() {
        const userId = this.getUser().userId;
        const siteId = this.validate({ id: 'int' }).id;

        const level = await this.model.sites.getMemberLevel(siteId, userId);

        return this.success(level);
    }

    async getByName() {
        let { username, sitename } = this.validate({
            username: 'string',
            sitename: 'string',
        });
        username = decodeURIComponent(username);
        sitename = decodeURIComponent(sitename);
        const user = await this.ctx.service.user.getUser({ username });
        if (!user) return this.throw(404);

        let site = await this.model.sites.findOne({
            where: { userId: user.id, sitename },
        });
        if (!site) return this.throw(404);
        site = site.get({ plain: true });

        return this.success({ user, site });
    }
};

module.exports = Site;
