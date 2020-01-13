'use strict';
const joi = require('joi');
const _ = require('lodash');

const Controller = require('../core/controller.js');
const {
    ENTITY_TYPE_USER,
    ENTITY_TYPE_SITE,
    ENTITY_TYPE_GROUP,
    ENTITY_TYPE_PROJECT,
    USER_ATTRS,
} = require('../core/consts.js');

const ENTITYS = [
    ENTITY_TYPE_USER,
    ENTITY_TYPE_SITE,
    ENTITY_TYPE_GROUP,
    ENTITY_TYPE_PROJECT,
];

const Favorite = class extends Controller {
    get modelName() {
        return 'favorites';
    }

    async search() {
        const query = this.validate();

        this.formatQuery(query);

        const result = await this.model.favorites.findAndCountAll({
            ...this.queryOptions,
            where: query,
        });

        return this.success(result);
    }

    async index() {
        const { model } = this;
        const { userId, objectType } = this.validate({
            objectType: joi
                .number()
                .valid(ENTITYS)
                .required(),
            userId: joi.number().required(),
        });

        let list = [];
        if (objectType === ENTITY_TYPE_USER) {
            list = await model.favorites.getFollowing(userId);
        } else if (objectType === ENTITY_TYPE_SITE) {
            list = await model.favorites.getFavoriteSites(userId);
        } else {
            const models = {
                [ENTITY_TYPE_PROJECT]: {
                    as: 'projects',
                    model: this.model.projects,
                    include: [
                        {
                            attributes: USER_ATTRS,
                            as: 'users',
                            model: this.model.users,
                        },
                    ],
                },
            };
            list = await this.model.favorites
                .findAll({
                    include: [models[objectType]],
                    where: { userId, objectType },
                })
                .then(l => _.map(l, o => o.toJSON()));
        }

        return this.success(list);
    }

    async create() {
        const { model } = this;
        const userId = this.authenticated().userId;
        const params = this.validate({
            objectId: 'int',
            objectType: joi
                .number()
                .valid(ENTITYS)
                .required(),
        });

        const data = await model.favorites.favorite(
            userId,
            params.objectId,
            params.objectType
        );

        return this.success(data);
    }

    async destroy() {
        const { model } = this;
        const userId = this.authenticated().userId;
        const params = this.validate({
            objectId: 'int',
            objectType: joi
                .number()
                .valid(ENTITYS)
                .required(),
        });

        const data = await model.favorites.unfavorite(
            userId,
            params.objectId,
            params.objectType
        );
        return this.success(data);
    }

    async exist() {
        const { model } = this;
        const userId = this.authenticated().userId;
        const params = this.validate({
            objectId: 'int',
            objectType: joi
                .number()
                .valid(ENTITYS)
                .required(),
        });
        const data = await model.favorites.findOne({
            where: {
                userId,
                objectId: params.objectId,
                objectType: params.objectType,
            },
        });

        const ok = !!data;

        return this.success(ok);
    }

    async follows() {
        const { model } = this;
        const { objectId, objectType } = this.validate({
            objectId: 'int',
            objectType: joi
                .number()
                .valid(ENTITYS)
                .required(),
        });

        const list = await model.favorites.getFollows(objectId, objectType);
        return this.success(list);
    }
};

module.exports = Favorite;
