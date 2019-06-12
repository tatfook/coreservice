'use strict';

const { app } = require('egg-mock/bootstrap');
const loadMockTools = require('./setup/loader')

before(() => {
  loadMockTools(app);
});

after(async () => {
  const opts = { restartIdentity: true };
  await Promise.all([
    app.model.User.truncate(opts),
    app.model.Userinfo.truncate(opts),
    app.model.World.truncate(opts),
    app.model.Project.truncate(opts),
    app.model.Member.truncate(opts),
  ]);
});
