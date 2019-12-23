'use strict';

const _ = require('lodash');

const Controller = require('../core/controller.js');

const Domain = class extends Controller {
    get modelName() {
        return 'domains';
    }

    async show() {
        const params = this.getParams();
        const id = _.toNumber(params.id) || decodeURIComponent(params.id);
        let data;
        if (_.isNumber(id)) data = await this.model.domains.getById(id);
        else data = await this.model.domains.getByDomain(id);

        return this.success(data);
    }

    async exist() {
        const params = await this.ctx.validate(
            this.app.validator.domain.exist,
            this.getParams()
        );
        const domain = decodeURIComponent(params.domain);
        const data = await this.model.domains.findOne({ where: { domain } });
        return this.success(!!data);
    }
};

module.exports = Domain;
