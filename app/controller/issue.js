/* eslint-disable no-magic-numbers */
'use strict';

const joi = require('joi');
const _ = require('lodash');

const Controller = require('../core/controller.js');
const {
    ENTITY_TYPE_USER,
    ENTITY_TYPE_SITE,
    ENTITY_TYPE_PAGE,
    ENTITY_TYPE_GROUP,
    ENTITY_TYPE_PROJECT, // 项目
} = require('../core/consts.js');

const ENTITYS = [
    ENTITY_TYPE_USER,
    ENTITY_TYPE_SITE,
    ENTITY_TYPE_PAGE,
    ENTITY_TYPE_GROUP,
    ENTITY_TYPE_PROJECT,
];

const Issue = class extends Controller {
    get modelName() {
        return 'issues';
    }

    async isPrivilege(objectId, objectType, userId, editable) {
        if (objectType !== ENTITY_TYPE_PROJECT) return false;

        const isMember = await this.model.members.findOne({
            objectId,
            objectType,
            memberId: userId,
        });
        if (isMember) return true;

        const project = await this.model.projects.getById(objectId);
        if (!editable) {
            // 读取
            if (project.privilege & 32) return true;
            return false;
        }
        if (project.privilege & 128) return true;
        false;

        return false;
    }

    async search() {
        const { userId } = this.getUser();
        const query = this.validate({
            objectId: 'int',
            objectType: joi
                .number()
                .valid(ENTITYS)
                .required(),
        });

        const isCanOper = await this.isPrivilege(
            query.objectId,
            query.objectType,
            userId,
            false
        );
        if (!isCanOper) return this.fail(7);

        this.formatQuery(query);

        const data = await this.model.issues.getObjectIssues(
            query,
            this.queryOptions
        );

        const openCount = await this.model.issues.count({
            where: { ...query, state: 0 },
        });
        const closeCount = await this.model.issues.count({
            where: { ...query, state: 1 },
        });
        return this.success({
            count: data.total,
            rows: data.issues,
            openCount,
            closeCount,
        });
    }

    async index() {
        const { userId } = this.getUser();
        const query = this.validate({
            objectId: 'int',
            objectType: joi
                .number()
                .valid(ENTITYS)
                .required(),
            state: 'int_optional',
            title: 'string_optional',
        });

        const isCanOper = await this.isPrivilege(
            query.objectId,
            query.objectType,
            userId,
            false
        );
        if (!isCanOper) return this.fail(7);

        this.formatQuery(query);

        const data = await this.model.issues.getObjectIssues(
            query,
            this.queryOptions
        );

        return this.success(data.issues);
    }

    async create() {
        const { userId } = this.authenticated();
        const params = this.validate({
            objectType: joi.number().valid(ENTITYS),
            objectId: 'int',
            title: 'string',
            content: 'string',
        });
        params.userId = userId;

        const isCanOper = await this.isPrivilege(
            params.objectId,
            params.objectType,
            userId,
            true
        );
        if (!isCanOper) return this.fail(7);

        const issue = await this.model.issues.findOne({
            order: [[ 'No', 'desc' ]],
            where: { objectId: params.objectId, objectType: params.objectType },
        });
        params.no = issue ? issue.no + 1 : 1;
        params.text = params.no + ' ' + params.title;

        let data = await this.model.issues.create(params);
        if (!data) return this.throw(500);
        data = data.get({ plain: true });

        return this.success(data);
    }

    async update() {
        const { userId } = this.authenticated();
        const params = this.validate({ id: 'int' });
        const { id } = params;

        const issue = await this.model.issues.getById(id);
        if (!issue) this.throw(400);

        const isCanOper = await this.isPrivilege(
            issue.objectId,
            issue.objectType,
            userId,
            true
        );
        if (!isCanOper) return this.fail(7);

        delete params.id;
        delete params.userId;
        _.merge(issue, params);
        issue.text = issue.no + ' ' + issue.title;

        const ok = await this.model.issues.update(issue, { where: { id } });

        return this.success(ok);
    }

    async destroy() {
        const { userId } = this.authenticated();
        const { id } = this.validate({ id: 'int' });

        const issue = await this.model.issues.getById(id);
        if (!issue) this.throw(400);

        const isCanOper = await this.isPrivilege(
            issue.objectId,
            issue.objectType,
            userId,
            true
        );
        if (!isCanOper) return this.fail(7);

        const ok = await this.model.issues.destroy({ where: { id } });

        return this.success(ok);
    }

    async show() {
        const { userId } = this.getUser();
        const { id } = this.validate({ id: 'int' });
        const issue = await this.model.issues.getById(id);
        if (!issue) this.throw(400);

        const isCanOper = await this.isPrivilege(
            issue.objectId,
            issue.objectType,
            userId,
            false
        );
        if (!isCanOper) return this.fail(7);

        issue.assigns = await this.model.issues.getIssueAssigns(issue.assigns);
        issue.user = await this.model.users.getBaseInfoById(issue.userId);

        return this.success(issue);
    }

    async statistics() {
        const { objectId, objectType } = this.validate({
            objectId: 'int',
            objectType: joi
                .number()
                .valid(ENTITYS)
                .required(),
        });

        const list = await this.model.issues.getObjectStatistics(
            objectId,
            objectType
        );

        return this.success(list);
    }
};

module.exports = Issue;
