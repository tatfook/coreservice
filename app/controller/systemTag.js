'use strict';

const Controller = require('../core/controller.js');

const SystemTag = class extends Controller {
    get modelName() {
        return 'systemTags';
    }

    async index() {
        const params = this.validate();

        const list = await this.model.systemTags
            .findAll({ where: params })
            .then(list => list.map(o => o.toJSON()));

        return this.success(list);
    }
};

module.exports = SystemTag;
