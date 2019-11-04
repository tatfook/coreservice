'use strict';
const Controller = require('../core/controller.js');

const Discount = class extends Controller {
    get modelName() {
        return 'discounts';
    }

    async create() {
        return this.success('OK');
    }
    async destroy() {
        return this.success('OK');
    }
    async update() {
        return this.success('OK');
    }
};

module.exports = Discount;
