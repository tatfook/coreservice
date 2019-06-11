'use strict';

module.exports = app => {
  const { factory } = app;
  factory.define('World', app.model.Userinfo, {
    worldName: factory.chance('word', { length: 10 }),
    revision: factory.chance('natural', { max: 100 }),
    giturl: factory.chance('url'),
    download: factory.chance('url'),
  });
};
