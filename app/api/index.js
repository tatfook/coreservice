'use strict';

const esAPI = require('./es');
const gitAPI = require('./git');
const keepworkAPI = require('./keepwork');
const lessonAPI = require('./lesson');
module.exports = app => {
    app.api = {
        es: esAPI(app),
        git: gitAPI(app),
        keepwork: keepworkAPI(app),
        lesson: lessonAPI(app),
    };
};
