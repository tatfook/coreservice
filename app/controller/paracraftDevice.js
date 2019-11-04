'use strict';

const Controller = require('../core/controller.js');

const ParacraftDevice = class extends Controller {
    get modelName() {
        return 'ParacraftDevices';
    }

    async show() {
        // const { deviceId, password } = this.validate({ deviceId: 'string', password: 'string' });
    }

    async pwdVerify() {
        const { deviceId, password } = this.validate({
            deviceId: 'string',
            password: 'string',
        });

        const data = await this.model.paracraftDevices
            .findOne({ where: { deviceId, password } })
            .then(o => o && o.toJSON());

        return this.success(!!data);
    }
};

module.exports = ParacraftDevice;
