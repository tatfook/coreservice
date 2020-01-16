'use strict';

const Controller = require('../core/controller.js');

const WorldLock = class extends Controller {
    async upsert() {
        const user = await this.authenticated();
        const payload = await this.ctx.validate(
            this.app.validator.worldlock.upsert,
            this.getParams()
        );
        this.ctx.body = await this.service.worldlock.upsertWorldlock(
            user,
            payload
        );
    }

    async destroy() {
        const user = await this.authenticated();
        const { pid } = await this.ctx.validate(
            this.app.validator.worldlock.destroy,
            this.getParams()
        );
        this.ctx.body = await this.service.worldlock.deleteWorldlock(user, pid);
    }
};

module.exports = WorldLock;
