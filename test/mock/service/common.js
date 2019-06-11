'use strict';

class CommonMockService {
  static async ok() {
    return true;
  }
}

module.exports = () => CommonMockService;
