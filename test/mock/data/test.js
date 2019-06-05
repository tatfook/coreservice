'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const { factory } = require('factory-girl');
require('./init');

async function testUser() {
  const userinfo = await factory.create('Userinfo');
  const user = await userinfo.getUsers();
  console.info(user.id, userinfo.userId);
  assert(user.id === userinfo.userId);

  const user1 = await app.model.User.findOne({
    id: user.id,
    include: [{
      model: app.model.Userinfo,
      as: 'userinfos',
    }],
  });
  assert(user1.id === user1.userinfos.userId);
}

describe('test/mock/data/test.js', () => {
  it('test user model', async () => {
    await testUser();
  });
});
