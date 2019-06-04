'use strict';

const Router = require('koa-router');

const router = new Router();

router.get('/', ctx => {
  ctx.body = 'hello, world!';
});

module.exports = router;
