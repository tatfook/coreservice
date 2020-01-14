'use strict';

const Axios = require('axios');

module.exports = app => {
    const INTERNAL_API_KEY = app.config.self.INTERNAL_API_KEY;
    const Client = Axios.create({
        baseURL: app.config.self.lessonBaseURL,
        headers: { 'x-api-key': INTERNAL_API_KEY },
    });

    const lessonApi = {
        async createRegisterMsg(user) {
            const result = await Client.post('/coreApi/registerMsg', {
                user,
            });
            return result.data;
        },

        async createUser({ id, username }) {
            return await Client.post('/coreApi/user', {
                id,
                username,
            });
        },

        async getPackagesByCondition(condition) {
            const ret = await Client.get('/coreApi/packages', {
                params: { condition },
            });
            return ret.data.data;
        },
    };

    return lessonApi;
};
