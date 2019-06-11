'use strict';

class MockWorldService {
  static async generateDefaultWorld() {
    return true;
  }
}

module.exports = () => MockWorldService;
