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
  app.loader.loadToApp(directory, 'mock');
};

module.exports = loadMockUtils;
