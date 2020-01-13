'use strict';

const Axios = require('axios');

module.exports = app => {
    const Client = Axios.create({
        baseURL: app.config.self.lessonBaseURL,
    });

    const INTERNAL_API_KEY = app.config.self.INTERNAL_API_KEY;
    const lessonApi = {
        async createRegisterMsg(user) {
            const result = await Client.post('/coreApi/registerMsg', {
                user,
                apiKey: INTERNAL_API_KEY,
            });
            return result.data;
        },

        async createUser({ id, username }) {
            return await Client.post('/coreApi/user', {
                id,
                username,
                apiKey: INTERNAL_API_KEY,
            });
        },

        async getPackagesByCondition(condition) {
            const ret = await Client.get('/coreApi/packages', {
                params: { condition, apiKey: INTERNAL_API_KEY },
            });
            return ret.data.data;
        },
    };

    return lessonApi;
};
