'use strict';

const Controller = require('../core/controller.js');

const Feedback = class extends Controller {
    async create() {
        const { userId, username } = this.authenticated();
        const data = await this.ctx.validate(
            this.app.validator.feedback.create,
            this.getParams()
        );

        const ret = await this.model.feedbacks.create({
            ...data,
            userId,
            username,
        });

        return this.success(ret);
    }
};

module.exports = Feedback;
