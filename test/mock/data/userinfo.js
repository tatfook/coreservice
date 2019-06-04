'use strict';

const { app } = require('egg-mock/bootstrap');
const { factory } = require('factory-girl');
const moment = require('moment');

module.exports = async () => {
  factory.define('Userinfo', app.model.Userinfo, {
    userId: factory.assoc('User', 'id'),
    name: factory.chance('string', { length: 10 }),
    qq: factory.chance('integer', { min: 10000, max: 999999999 }),
    birthdate: moment.now,
    school: factory.chance('string', { length: 10 }),
  });
};
