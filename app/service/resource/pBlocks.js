'use strict';
const Model = require('./model.js');

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

    async buildList() {}

    async build() {}

    async afterCreate(data) {
        await this.setBlockClassifies(data);
    }

    async afterUpdate(data) {
        await this.setBlockClassifies(data);
    }

    async afterDelete() {}
}

module.exports = PBlocks;
