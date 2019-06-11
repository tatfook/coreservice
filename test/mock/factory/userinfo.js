'use strict';

const moment = require('moment');

module.exports = app => {
  const { factory } = app;
  factory.define('Userinfo', app.model.Userinfo, {
    userId: factory.assoc('User', 'id'),
    name: factory.chance('word', { length: 10 }),
    qq: factory.chance('integer', { min: 10000, max: 999999999 }),
    birthdate: moment.now,
    school: factory.chance('word', { length: 10 }),
  });
};
