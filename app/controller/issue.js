/* eslint-disable no-magic-numbers */
'use strict';
const _ = require('lodash');

const Controller = require('../core/controller.js');
const {
    ENTITY_TYPE_PROJECT, // 项目
    PROJECT_PRIVILEGE_ISSUE_VIEW_ALL,
    PROJECT_PRIVILEGE_ISSUE_EDIT_ALL,
} = require('../core/consts.js');

const Issue = class extends Controller {
    async isPrivilege(objectId, objectType, userId, editable) {
        if (objectType !== ENTITY_TYPE_PROJECT) return false;

        const isMember = await this.model.members.findOne({
            where: {
                objectId,
                objectType,
                memberId: userId,
            },
        });
        if (isMember) return true;

        const project = await this.model.projects.getById(objectId);
        if (!editable) {
            // 读取
            if (project.privilege & PROJECT_PRIVILEGE_ISSUE_VIEW_ALL) {
                return true;
            }
            return false;
        }
        if (project.privilege & PROJECT_PRIVILEGE_ISSUE_EDIT_ALL) return true;

        return false;
    }
    // http://yapi.kp-para.cn/project/32/interface/api/732
    async search() {
        const { userId } = this.getUser();
        const query = await this.ctx.validate(
            this.app.validator.issue.query,
            this.getParams()
        );

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
        const query = await this.ctx.validate(
            'validator.issue.query',
            this.getParams()
        );

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
        const params = await this.ctx.validate(
            'validator.issue.createBody',
            this.getParams()
        );
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
        data = data.get({ plain: true });

        return this.success(data);
    }

    async update() {
        const { userId } = this.authenticated();
        const params = await this.ctx.validate(
            'validator.issue.updateBody',
            this.getParams()
        );
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
        const { id } = await this.ctx.validate(
            'validator.id',
            this.getParams()
        );

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
        const { id } = await this.ctx.validate(
            'validator.id',
            this.getParams()
        );
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
        const { objectId, objectType } = await this.ctx.validate(
            this.app.validator.issue.query,
            this.getParams()
        );

        const list = await this.model.issues.getObjectStatistics(
            objectId,
            objectType
        );

        return this.success(list);
    }
};

module.exports = Issue;
