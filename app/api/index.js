'use strict';

const esAPI = require('./es');
const gitAPI = require('./git');
const keepworkAPI = require('./keepwork');

module.exports = app => {
    app.api = {
        es: esAPI(app),
        git: gitAPI(app),
        keepwork: keepworkAPI(app),
    };
};
