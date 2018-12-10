const _ = require('lodash');
const cache = require('memory-cache');
const consts = require('./app/core/consts.js');
const util = require('./app/core/util.js');
const sms = require('./app/core/sms.js');
const email = require('./app/core/email.js');
const axios = require('./app/core/axios.js');
const api = require('./app/core/api.js');
const qiniu = require('./app/core/qiniu.js');
const pingpp = require('./app/core/pingpp.js');
const git = require('./app/core/git.js');
const gitGateway = require('./app/core/gitGateway.js');
const model = require('./app/core/model.js');
const ahocorasick = require('./app/core/ahocorasick.js');
const log = require("./app/core/log.js");

module.exports = app => {
  app.cache = cache;
  app.consts = consts;
  app.util = util;
  app.unittest = app.config.env == 'unittest';

  console.log(app.config.self);
  //console.log(app.lessonModel);

  sms(app);
  email(app);
  axios(app);
  api(app);
  qiniu(app);
  git(app);
  gitGateway(app);
  model(app);
  ahocorasick(app);
  log(app);

  //console.log(app.config.env);

  //console.log("----------构建表-----------");
  //app.model.files.sync({force:true});
  //app.model.storages.sync({force:true});
  //app.model.siteFiles.sync({force:true});

  //app.model.applies.sync({force:true});
  //app.model.caches.sync({force:true});
  //app.model.comments.sync({force:true});
  //app.model.contributions.sync({force:true});
  //app.model.datas.sync({force:true});
  //app.model.domains.sync({force:true});
  //app.model.favorites.sync({force:true});
  //app.model.groups.sync({force:true});
  //app.model.issues.sync({force:true});
  //app.model.logs.sync({force:true});
  //app.model.members.sync({force:true});
  //app.model.notifications.sync({force:true});
  //app.model.oauthUsers.sync({force:true});
  //app.model.pages.sync({force:true});
  //app.model.projects.sync({force:true});
  //app.model.roles.sync({force:true});
  //app.model.sensitiveWords.sync({force:true});
  //app.model.sites.sync({force:true});
  //app.model.siteGroups.sync({force:true});
  //app.model.tags.sync({force:true});
  //app.model.trades.sync({force:true});
  //app.model.users.sync({force:true});
  //app.model.visitors.sync({force:true});
  //app.model.worlds.sync({force:true});

  //app.model.accounts.sync({force:true});
  //app.model.trades.sync({force:true});
  //app.model.orders.sync({force:true});
  //app.model.discounts.sync({force:true});
};

