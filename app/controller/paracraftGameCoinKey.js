/* eslint-disable no-magic-numbers */
'use strict';
const Controller = require('../core/controller.js');

const ParacraftGameCoinKey = class extends Controller {
    get modelName() {
        return 'paracraftGameCoinKeys';
    }

    async active() {
        const { key } = this.validate({ key: 'string' });

        const data = await this.model.paracraftGameCoinKeys
            .findOne({ where: { key } })
            .then(o => o && o.toJSON());
        if (!data) return this.fail(15);
        if (data.active) return this.fail(16);

        const ok = await this.model.ParacraftGameCoinKey.update(
            {
                active: 1,
                activeTime: new Date(),
            },
            { where: { key } }
        );

        return this.success(ok[0] === 1 ? data.gameCoin : 0);
    }
};

module.exports = ParacraftGameCoinKey;
