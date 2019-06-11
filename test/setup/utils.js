'use strict';

const path = require('path');

const loadMockUtils = app => {
  const defaultConfig = {
    baseDir: path.join('mock', 'utils'),
    enabled: true,
  };
  const config = Object.assign({}, defaultConfig, app.config.mockUtils);
  const { enabled, baseDir } = config;
  if (enabled === false) return;

  const directory = path.join(app.config.baseDir, 'test', baseDir);
  const _mockUtils = Symbol('_mockUtils');
  app.loader.loadToApp(directory, _mockUtils);
  app.mock.utils = app[_mockUtils];
};

module.exports = loadMockUtils;
