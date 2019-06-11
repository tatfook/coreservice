'use strict';

module.exports = app => {
  const { factory } = app;
  factory.define('Project', app.model.Project, {
    userId: factory.assoc('User', 'id'),
    name: factory.chance('word', { length: 10 }),
    siteId: factory.chance('natural', { min: 0, max: 20 }),
    status: 2,
    visibility: 0,
    privilege: 165,
  });
};
