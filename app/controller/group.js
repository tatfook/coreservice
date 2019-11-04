'use strict';
const _ = require('lodash');

const { ENTITY_TYPE_GROUP } = require('../core/consts.js');

const Controller = require('../core/controller.js');

const Group = class extends Controller {
    get modelName() {
        return 'groups';
    }

    async index() {
        const { userId } = this.authenticated();

        const groups = await this.model.groups.findAll({ where: { userId } });
        _.each(groups, (o, i) => {
            groups[i] = o.get({ plain: true });
        });

        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            group.members = await this.model.members.getObjectMembers(
                group.id,
                ENTITY_TYPE_GROUP
            );
        }

        return this.success(groups);
    }

    // 创建组
    async create() {
        const { userId } = this.authenticated();
        const params = this.validate({ groupname: 'string' });
        const members = params.members || [];

        params.userId = userId;
        delete params.members;

        const group = await this.model.groups.create(params);

        await this.model.members.setObjectMembers(
            group.id,
            ENTITY_TYPE_GROUP,
            members,
            userId
        );

        return this.success(group);
    }

    // update
    async update() {
        const { userId } = this.authenticated();
        const params = this.validate({ id: 'int' });
        const members = params.members || [];
        const { id } = params;

        params.userId = userId;
        delete params.members;

        const result = await this.model.groups.update(params, {
            where: { id, userId },
        });

        if (result[0]) {
            await this.model.members.setObjectMembers(
                id,
                ENTITY_TYPE_GROUP,
                members,
                userId
            );
        }

        return this.success('ok');
    }

    async destroy() {
        const { model } = this;
        const userId = this.authenticated().userId;
        const params = this.validate({ id: 'int' });

        const ok = await model.groups.deleteById(params.id, userId);

        return this.success(ok);
    }

    // 添加成员
    async postMembers() {
        const userId = this.authenticated().userId;
        const params = this.validate({
            id: 'int',
            memberName: 'string',
        });

        const user = await this.model.users.getByName(params.memberName);
        if (!user) this.throw(400, '成员不存在');
        const memberId = user.id;

        const data = await this.model.members.create({
            userId,
            objectId: params.id,
            objectType: ENTITY_TYPE_GROUP,
            memberId,
        });

        return this.success(data);
    }

    // 删除成员
    async deleteMembers() {
        const userId = this.authenticated().userId;
        const params = this.validate({
            id: 'int',
            memberName: 'string',
        });

        const user = await this.model.users.getByName(params.memberName);
        if (!user) this.throw(400, '成员不存在');
        const memberId = user.id;

        const data = await this.model.members.destroy({
            where: {
                userId,
                objectId: params.id,
                objectType: ENTITY_TYPE_GROUP,
                memberId,
            },
        });

        return this.success(data);
    }

    // 获取组成员
    async getMembers() {
        const userId = this.authenticated().userId;
        const id = this.validate({ id: 'int' }).id;

        const list = await this.model.groups.getGroupMembers(userId, id);

        return this.success(list);
    }
};

module.exports = Group;
