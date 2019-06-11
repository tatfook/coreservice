'use strict';

class MockUserService {
  static async mockValidateToken() {
    return true;
  }
}

module.exports = () => MockUserService;
