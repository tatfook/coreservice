'use strict';
const Model = require('./model.js');
const _ = require('lodash');
class PBlocks extends Model {
    // constructor(app) {
    //     super(app);
    // }

    async setBlockClassifies(data) {
        if (!data.id || !data.pClassifies) return;

        await this.app.model.pBlockClassifies.destroy({
            where: { blockId: data.id },
        });

        const bcs = data.pClassifies.map(o => ({
            blockId: data.id,
            classifyId: o.id,
        }));

        await this.app.model.pBlockClassifies.bulkCreate(bcs);
    }

    async setBlockAccess(data) {
        if (!data.id || !data.pBlockAccesses) return;

        await this.app.model.pBlockAccesses.destroy({
            where: { pBlockId: data.id },
        });
        const opts = _.pick(
            data.pBlockAccesses,
            ...[ 'vip', 'commonUser', 't1', 't2', 't3', 't4', 't5' ]
        );
        opts.pBlockId = data.id;
        await this.app.model.pBlockAccesses.create(opts);
    }
    async buildList() {}

    async build() {}

    async afterCreate(data) {
        await this.setBlockClassifies(data);
        await this.setBlockAccess(data);
    }

    async afterUpdate(data) {
        await this.setBlockClassifies(data);
        await this.setBlockAccess(data);
    }

    async afterDelete() {}
}

module.exports = PBlocks;
