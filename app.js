'use strict';
// const _ = require('lodash');
const cache = require('memory-cache');
const consts = require('./app/core/consts.js');
const util = require('./app/core/util.js');
const sms = require('./app/core/sms.js');
const email = require('./app/core/email.js');
const axios = require('./app/core/axios.js');
const api = require('./app/core/api.js');
const qiniu = require('./app/core/qiniu.js');
// const pingpp = require('./app/core/pingpp.js');
const model = require('./app/core/model.js');
const ahocorasick = require('./app/core/ahocorasick.js');
const log = require('./app/core/log.js');

module.exports = app => {
    app.cache = cache; // 产品部署时采用了负载均衡 内存缓存失效 禁用此功能
    app.consts = consts;
    app.util = util;
    app.unittest = app.config.env === 'unittest';

    sms(app);
    email(app);
    axios(app);
    api(app);
    qiniu(app);
    model(app);
    ahocorasick(app);
    log(app);

    app.keepworkModel = app.model;
};
