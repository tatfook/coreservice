'use strict';

const DataLoader = require('dataloader');
// const Service = require('egg').Service;
const Service = require('../core/service.js');

class Loader extends Service {
    getLoader({ modelName, batchFn, loaderName, model = 'model' }) {
        const app = this.app;
        const Op = app.Sequelize.Op;
        this.loader = this.loader || {};
        loaderName = loaderName || modelName;
        batchFn =
            batchFn ||
            (keys =>
                app[model][modelName].findAll({
                    where: { id: { [Op.in]: keys } },
                }));
        this.loader[loaderName] =
            this.loader[loaderName] || new DataLoader(batchFn);
        return this.loader[loaderName];
    }

    fetchUserById(id) {
        const loader = this.getLoader({ modelName: 'users' });

        return loader.load(id);
    }

    fetchProjectById(id) {
        const loader = this.getLoader({
            modelName: 'projects',
        });

        return loader.load(id);
    }
}

module.exports = Loader;
