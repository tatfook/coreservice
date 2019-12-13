'use strict';

const consts = require('./app/core/consts.js');
const util = require('./app/core/util.js');
const sms = require('./app/core/sms.js');
const email = require('./app/core/email.js');
const axios = require('./app/core/axios.js');
const qiniu = require('./app/core/qiniu.js');
// const pingpp = require('./app/core/pingpp.js');
const ahocorasick = require('./app/core/ahocorasick.js');
const log = require('./app/core/log.js');
module.exports = app => {
    app.consts = consts;
    app.util = util;
    app.unittest = app.config.env === 'unittest';

    sms(app);
    email(app);
    axios(app);
    qiniu(app);
    ahocorasick(app);
    log(app);

    app.keepworkModel = app.model;

    app.loader.loadToApp(`${app.baseDir}/app/api`, 'api');
};
