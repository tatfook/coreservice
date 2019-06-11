'use strict';

module.exports = app => {
  const { factory } = app;
  factory.define('User', app.model.User, {
    username: factory.chance('word', { length: 10 }),
    password: factory.chance('string', { length: 10 }),
    roleId: 0,
    email: factory.chance('email'),
    cellphone: factory.chance('integer', { min: 13000000000, max: 20000000000 }),
    realname: factory.chance('integer', { min: 13000000000, max: 20000000000 }),
    nickname: factory.chance('word', { length: 10 }),
    portrait: factory.chance('avatar', { protocol: 'https', fileExtension: 'jpg' }),
    sex: factory.chance('string', { length: 1, pool: 'FM' }),
    description: factory.chance('paragraph', ({ sentences: 3 })),
  });
};
