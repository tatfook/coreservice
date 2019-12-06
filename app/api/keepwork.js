'use strict';

const Axios = require('axios');

module.exports = app => {
    const config = app.config.self;
    const Client = Axios.create({
        baseURL: `${config.keepworkBaseURL}/`,
    });

    const keepworkAPI = {
        async parseMarkdown(content) {
            const result = await Client.post('/es/parser', { content });
            return result.data.content;
        },
    };

    return keepworkAPI;
};
