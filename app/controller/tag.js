'use strict';
const Controller = require('../core/controller.js');
const Tag = class extends Controller {
    get modelName() {
        return 'tags';
    }
};

module.exports = Tag;
