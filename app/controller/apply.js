'use strict';

const joi = require('joi');

const Controller = require('../core/controller.js');
const {
    ENTITY_TYPE_USER,
    ENTITY_TYPE_SITE,
    ENTITY_TYPE_PAGE,
    ENTITY_TYPE_GROUP,
    ENTITY_TYPE_PROJECT,

    APPLY_STATE_DEFAULT,
    APPLY_STATE_AGREE,
    APPLY_STATE_REFUSE,
    APPLY_TYPE_MEMBER,
} = require('../core/consts.js');
const ENTITYS = [
    ENTITY_TYPE_USER,
    ENTITY_TYPE_SITE,
    ENTITY_TYPE_PAGE,
    ENTITY_TYPE_GROUP,
    ENTITY_TYPE_PROJECT,
];

const Apply = class extends Controller {
    get modelName() {
        return 'applies';
    }

    async index() {
        const query = this.validate({
            objectType: joi.number().valid(ENTITY_TYPE_PROJECT),
            objectId: 'int',
            applyType: 'int',
        });

        const list = await this.model.applies.getObjectApplies({
            where: query,
        });

        return this.success(list);
    }

    async create() {
        const { userId } = this.authenticated();
        const params = this.validate({
            objectType: joi.number().valid(ENTITY_TYPE_PROJECT),
            objectId: 'int',
            applyType: joi.number().valid(APPLY_TYPE_MEMBER),
            applyId: 'int',
        });

        params.userId = userId;
        params.state = APPLY_STATE_DEFAULT;
        // delete params.state;
        await this.model.applies.upsert(params);
        const data = await this.model.applies.findOne({
            where: {
                objectId: params.objectId,
                objectType: params.objectType,
                applyType: params.applyType,
                applyId: params.applyId,
            },
        });

        return this.success(data);
    }

    async update() {
        const { userId } = this.authenticated();
        const { id, state } = this.validate({ id: 'int', state: 'int' });
        let ok = 0;

        if (state === APPLY_STATE_AGREE) {
            ok = await this.model.applies.agree(id, userId);
        } else if (state === APPLY_STATE_REFUSE) {
            ok = await this.model.applies.refuse(id, userId);
        }

        if (ok !== 0) this.throw(400);

        return this.success('OK');
    }

    async state() {
        const params = this.validate({
            applyId: 'int',
            applyType: 'int',
            objectId: 'int',
            objectType: joi
                .number()
                .valid(ENTITYS)
                .required(),
        });

        const list = await this.model.applies.findAll({
            order: [[ 'createdAt', 'desc' ]],
            where: params,
        });

        const state = list.length === 0 ? -1 : list[0].state;

        return this.success(state);
    }
};

module.exports = Apply;
