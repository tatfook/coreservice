'use strict';

const loadMockAxios = require('./mock-axios');
const loadFactory = require('./factory');
const loadMockUtils = require('./utils');

const loadMockTools = app => {
  loadMockAxios(app);
  loadFactory(app);
  loadMockUtils(app);
};

module.exports = loadMockTools;
