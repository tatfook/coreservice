'use strict';

const { app } = require('egg-mock/bootstrap');
const { factory } = require('factory-girl');

const mockUserModel = require('./user');
const mockUserinfoModel = require('./userinfo');

before(async () => {
  await app.ready();
  await Promise.all([
    mockUserModel(),
    mockUserinfoModel(),
  ]);
});

after(async () => {
  await factory.cleanUp();
});
