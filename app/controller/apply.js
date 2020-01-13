'use strict';
/**
 * 申请类接口
 * http://yapi.kp-para.cn/project/32/interface/api/cat_197
 */

const Controller = require('../core/controller.js');
const {
    APPLY_STATE_DEFAULT,
    APPLY_STATE_AGREE,
    APPLY_STATE_REFUSE,
} = require('../core/consts.js');

const Apply = class extends Controller {
    get modelName() {
        return 'applies';
    }

    async index() {
        const query = await this.ctx.validate(
            this.app.validator.apply.common,
            this.getParams()
        );

        const list = await this.model.applies.getObjectApplies({
            where: query,
        });

        return this.success(list);
    }

    async create() {
        const { userId } = this.authenticated();
        const params = await this.ctx.validate(
            this.app.validator.apply.create,
            this.getParams()
        );

        params.userId = userId;
        params.state = APPLY_STATE_DEFAULT;

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
        const { id, state } = await this.ctx.validate(
            this.app.validator.apply.update,
            this.getParams()
        );
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
        const params = await this.ctx.validate(
            this.app.validator.apply.state,
            this.getParams()
        );

        const list = await this.model.applies.findAll({
            order: [[ 'createdAt', 'desc' ]],
            where: params,
        });

        const state = list.length === 0 ? -1 : list[0].state;

        return this.success(state);
    }
};

module.exports = Apply;
