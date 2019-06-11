'use strict';

const path = require('path');
const Axios = require('axios');
const AxiosMockAdapter = require('axios-mock-adapter');

const loadMockAxios = app => {
  const defaultConfig = {
    baseDir: path.join('mock', 'axios'),
    enabled: true,
  };
  const config = Object.assign({}, defaultConfig, app.config.mockAxios);
  const { enabled, baseDir } = config;
  if (enabled === false) return;

  const mockAxios = new AxiosMockAdapter(Axios);
  app.mockAxios = mockAxios;

  const directory = path.join(app.config.baseDir, 'test', baseDir);
  app.loader.loadToApp(directory, Symbol('_mock_axios'));
};

module.exports = loadMockAxios;
