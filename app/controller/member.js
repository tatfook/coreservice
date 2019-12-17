'use strict';
/**
 * 成员接口，对应的yapi文档
 * http://yapi.kp-para.cn/project/32/interface/api/cat_187
 */
const {
    ENTITY_TYPE_SITE,
    ENTITY_TYPE_GROUP,
    ENTITY_TYPE_PROJECT,
} = require('../core/consts.js');

const Controller = require('../core/controller.js');

const Member = class extends Controller {
    get modelName() {
        return 'members';
    }

    getModel(objectType) {
        const models = {
            [ENTITY_TYPE_PROJECT]: this.model.projects,
            [ENTITY_TYPE_SITE]: this.model.sites,
            [ENTITY_TYPE_GROUP]: this.model.groups,
        };

        return models[objectType];
    }

    async index() {
        const params = await this.ctx.validate(
            'validator.member.common',
            this.getParams()
        );

        const list = await this.model.members.getObjectMembers(
            params.objectId,
            params.objectType
        );

        await this.service.user.addUserAttrByUserIds(list);

        return this.success(list);
    }

    // 块创建
    async bulkCreate() {
        const { userId } = this.authenticated();
        const {
            objectId,
            objectType,
            memberIds = [],
        } = await this.ctx.validate(
            'validator.member.bulkCreate',
            this.getParams()
        );
        if (memberIds.length === 0) return this.success('OK');
        const model = this.getModel(objectType);
        const data = await model.getById(objectId, userId);
        if (!data) return this.throw(400);

        const promises = memberIds.map(item => {
            return this.model.members.upsert({
                userId,
                objectId,
                objectType,
                memberId: item,
            });
        });
        await Promise.all(promises);
        return this.success('OK');
    }

    async create() {
        const { userId } = this.authenticated();
        const params = await this.ctx.validate(
            this.app.validator.member.create,
            this.getParams()
        );
        params.userId = userId;

        const model = this.getModel(params.objectType);
        let data = await model.getById(params.objectId, userId);
        if (!data) return this.throw(400);

        data = await this.model.members.create(params);

        return this.success(data);
    }

    async destroy() {
        const { userId } = this.authenticated();
        const { id } = await this.ctx.validate(
            this.app.validator.id,
            this.getParams()
        );

        const member = await this.model.members.findOne({
            where: { id, userId },
        });
        if (!member) return this.throw(404);

        await this.model.members.destroy({ where: { id, userId } });

        await this.model.applies.destroy({
            where: {
                objectId: member.objectId,
                objectType: member.objectType,
                userId: member.memberId,
            },
        });

        return this.success('OK');
    }

    async exist() {
        const { userId } = this.authenticated();
        const {
            objectId,
            objectType,
            memberId = userId,
        } = await this.ctx.validate('validator.member.exist', this.getParams());
        const data = await this.model.members.findOne({
            where: {
                objectId,
                objectType,
                memberId,
            },
        });

        if (!data) return this.success(false);

        return this.success(true);
    }
};

module.exports = Member;
