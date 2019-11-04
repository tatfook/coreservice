'use strict';
const _ = require('lodash');
const DataLoader = require('dataloader');

module.exports = {
    getParams() {
        return _.merge({}, this.request.body, this.query, this.params);
    },

    authenticated() {
        const user = this.state.user;
        const admin = this.state.admin;
        if (!user || user.userId === undefined) {
            if (!admin || admin.userId === undefined) return this.throw(401);
            return admin;
        }
        return user;
    },

    adminAuthenticated() {
        const config = this.config.self;
        const token = this.ctx.token;
        const user = this.app.util.jwt_decode(
            token || '',
            config.adminSecret,
            true
        );
        if (!user) return this.throw(401);

        return user;
    },

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
    },
};
