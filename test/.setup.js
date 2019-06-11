'use strict';

const { app } = require('egg-mock/bootstrap');
const loadMockTools = require('./setup/loader')

before(async () => {
  await app.ready();
  loadMockTools(app);
});

after(async () => {
  await app.factory.cleanUp();
});
