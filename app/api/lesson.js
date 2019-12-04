'use strict';

const Axios = require('axios');
const { LESSON_API_KEY } = require('../core/consts.js');
module.exports = app => {
    const Client = Axios.create({
        baseURL: app.config.self.lessonBaseURL,
    });

    const lessonApi = {
        async createRegisterMsg(user) {
            const result = await Client.post('/coreApi/registerMsg', {
                user,
                apiKey: LESSON_API_KEY,
            });
            return result.data;
        },
    };

    return lessonApi;
};
