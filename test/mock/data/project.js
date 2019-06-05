'use strict';

const { app } = require('egg-mock/bootstrap');
const { factory } = require('factory-girl');

module.exports = async () => {
  factory.define('Project', app.model.Project, {
    userId: factory.assoc('User', 'id'),
    name: factory.chance('string', { length: 10 }),
    siteId: factory.chance('integer'),
    status: 2,
    visibility: 0,
    privilege: 165,
  });
};
