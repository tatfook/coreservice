'use strict';

const { app } = require('egg-mock/bootstrap');
const router = require('./router');
const Koa = require('koa');

const mockApi = new Koa;
mockApi.use(router.routes());
mockApi.use(router.allowedMethods());

module.exports = async () => {
  await app.ready();
  const { port } = app.config.mock;
  mockApi.listen(port);
};
