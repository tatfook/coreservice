'use strict';
const Subscription = require('egg').Subscription;

class Test extends Subscription {
    static get schedule() {
        return {
            interval: '3s',
            type: 'worker',
            disable: true,
        };
    }

    async subscribe() {
        this.logger.info('i am subscribe');

        return Promise.resolve(1);
    }
}

module.exports = Test;
