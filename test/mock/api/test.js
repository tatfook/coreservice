'use strict';

// const { app, assert } = require('egg-mock/bootstrap');
// const runMockApiServer = require('./server');

const Axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

// let host;

// before(async () => {
//   await runMockApiServer();
//   host = `${app.config.mock.host}:${app.config.mock.port}`;
// });

// describe('test/mock/apiServer/test.js', () => {
//   describe('test mock api server', () => {
//     it('should return "hello, world"', async () => {
//       const res = await app.httpclient.request(host);
//       assert(res.data.toString() === 'hello, world!');
//     });
//   });
// });

const mock = new MockAdapter(Axios);
const client = new Axios.create({
  baseURL: 'https://www.baidu.com/',
});

mock.onGet('https://www.baidu.com/').reply(200, 'hello, world');
client.get('/').then(rsp => console.log(rsp.data));
