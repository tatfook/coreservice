'use strict';

const { app } = require('egg-mock/bootstrap');
const { factory } = require('factory-girl');
const assign = require('../utils/token');
const { mockValidateToken } = require('../mock/service/user');

require('../mock/data/init');

describe('test/controller/project.test.js', () => {
  describe('create project', () => {
    it('should return 200', async () => {
      const user = await factory.create('User');
      const token = assign(user);

      app.mockService('user', 'validateToken', mockValidateToken);
      return app.httpRequest()
        .post('/api/v0/projects')
        .set('Authorization', token)
        .expect(400);
    });
  });
});
