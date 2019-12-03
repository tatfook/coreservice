'use strict';
const Model = require('./model.js');
const _ = require('lodash');
class PBlocks extends Model {
    async setClassifyAccess(data) {
        if (!data.id || !data.pClassifyAccesses) return;

        await this.app.model.pClassifyAccesses.destroy({
            where: { pClassifyId: data.id },
        });
        const opts = _.pick(
            data.pClassifyAccesses,
            ...[ 'vip', 'commonUser', 't1', 't2', 't3', 't4', 't5' ]
        );
        opts.pClassifyId = data.id;
        await this.app.model.pClassifyAccesses.create(opts);
    }

    async buildList() {}

    async build() {}

    async afterCreate(data) {
        await this.setClassifyAccess(data);
    }

    async afterUpdate(data) {
        await this.setClassifyAccess(data);
    }

    async afterDelete() {}
}

module.exports = PBlocks;
