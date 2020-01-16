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
        async buildBlocks(content) {
            const result = await Client.post('/es/buildBlocks', { content });
            return result.data.blocks;
        },
        async buildContent(blocks) {
            const result = await Client.post('/es/buildContent', { blocks });
            return result.data.content;
        },
    };

    return keepworkAPI;
};
