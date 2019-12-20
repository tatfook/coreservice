'use strict';

const joi = require('joi');
const _ = require('lodash');

const Controller = require('../core/controller.js');
const {
    ENTITY_TYPE_USER,
    ENTITY_TYPE_SITE,
    ENTITY_TYPE_PAGE,
    ENTITY_TYPE_GROUP,
    ENTITY_TYPE_ISSUE,
    ENTITY_TYPE_PROJECT,
} = require('../core/consts.js');

const ENTITYS = [
    ENTITY_TYPE_USER,
    ENTITY_TYPE_SITE,
    ENTITY_TYPE_PAGE,
    ENTITY_TYPE_GROUP,
    ENTITY_TYPE_ISSUE,
    ENTITY_TYPE_PROJECT,
];

const Comment = class extends Controller {
    get modelName() {
        return 'comments';
    }

    async index() {
        const params = this.validate();

        this.formatQuery(params);

        const list = await this.model.comments.findAndCountAll({
            ...this.queryOptions,
            where: params,
        });

        await this.service.user.addUserAttrByUserIds(list.rows);

        return this.success(list);
    }

    async create() {
        const userId = this.authenticated().userId;
        let { objectType, objectId, content } = this.validate({
            objectType: joi.number().valid(ENTITYS),
            content: 'string',
        });
        if (!objectId) return this.throw(400, '参数错误');
        objectId = _.toString(objectId);

        const data = await this.model.comments.createComment(
            userId,
            objectId,
            objectType,
            content
        );
        if (!data) this.throw(400);

        return this.success(data);
    }

    async destroy() {
        const { userId } = this.authenticated();
        const { id } = this.validate({ id: 'int' });

        await this.model.comments.deleteComment(id, userId);

        return this.success('OK');
    }
};

module.exports = Comment;
