'use strict';

const consts = require('./app/core/consts.js');
const util = require('./app/core/util.js');
const sms = require('./app/core/sms.js');
const email = require('./app/core/email.js');
const axios = require('./app/core/axios.js');
const api = require('./app/api/index.js');
const qiniu = require('./app/core/qiniu.js');
// const pingpp = require('./app/core/pingpp.js');
const ahocorasick = require('./app/core/ahocorasick.js');
const log = require('./app/core/log.js');
const assert = require('assert');
const { join } = require('path');
module.exports = app => {
    app.consts = consts;
    app.util = util;
    app.unittest = app.config.env === 'unittest';

    sms(app);
    email(app);
    axios(app);
    api(app);
    qiniu(app);
    ahocorasick(app);
    log(app);

    app.keepworkModel = app.model;

    const { keyword = 'validator2' } = app.config.ajv || {};
    app.loader.loadToApp(join(app.baseDir, `app/${keyword}`), keyword, {
        initializer(exp, { path, pathName }) {
            assert(
                app.ajv.validateSchema(exp),
                `${path} should be a valid schema`
            );
            app.ajv.addSchema(
                Object.assign(
                    {
                        $id: pathName,
                        // 异步方式进行校验，验证错误抛出错误
                        $async: true,
                    },
                    exp
                ),
                pathName
            );
            return exp;
        },
    });
};
