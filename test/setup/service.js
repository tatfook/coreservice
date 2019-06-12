'use strict';

const path = require('path');

const loadMockService = app => {
  const defaultConfig = {
    baseDir: path.join('mock', 'service'),
    enabled: true,
  };
  const config = Object.assign({}, defaultConfig, app.config.mockService);
  const { enabled, baseDir } = config;
  if (enabled === false) return;

  const directory = path.join(app.config.baseDir, 'test', baseDir);
  const _mockService = Symbol('_mockservice');
  app.loader.loadToApp(directory, _mockService);
  app.mock.service = app[_mockService];
};

module.exports = loadMockService;
