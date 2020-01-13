'use strict';
const Model = require('./model.js');
const _ = require('lodash');
const fields = ['vip', 'commonUser', 't1', 't2', 't3', 't4', 't5'];
class PBlocks extends Model {
    async setClassifyAccess(data) {
        if (!data.id) return;
        // 无权限传过来则添加默认权限
        if (!data.pClassifyAccesses) {
            data.pClassifyAccesses = {};
            fields.forEach(field => {
                data.pClassifyAccesses[field] = 1;
            });
        }

        await this.app.model.pClassifyAccesses.destroy({
            where: { pClassifyId: data.id },
        });
        const opts = _.pick(data.pClassifyAccesses, ...fields);
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

    async afterDelete(id) {
        await this.app.model.pClassifyAccesses.destroy({
            where: { pClassifyId: id },
        });
    }
}

module.exports = PBlocks;
