'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const runMockApiServer = require('./server');

let host;

before(async () => {
  await runMockApiServer();
  host = `${app.config.mock.host}:${app.config.mock.port}`;
});

describe('test/mock/apiServer/test.js', () => {
  describe('test mock api server', () => {
    it('should return "hello, world"', async () => {
      const res = await app.httpclient.request(host);
      assert(res.data.toString() === 'hello, world!');
    });
  });
});
