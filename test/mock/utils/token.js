'use strict';

const { app } = require('egg-mock/bootstrap');

const getMockToken = user => {
  const { secret, tokenExpire } = app.config.self;
  return 'Bearer ' + app.util.jwt_encode({
    userId: user.id,
    roleId: user.roleId,
    username: user.username,
  }, secret, tokenExpire);
};

module.exports = () => getMockToken;
