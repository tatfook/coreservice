'use strict';

const DataLoader = require('dataloader');

class UserRankConnector {
    constructor(ctx) {
        this.ctx = ctx;
        this.model = ctx.app.model;
        this.loader = new DataLoader(this.fetch.bind(this));
    }

    fetch(ids) {
        const users = this.ctx.app.model.userRanks
            .findAll({
                where: {
                    id: {
                        $in: ids,
                    },
                },
            })
            .then(us => us.map(u => u.toJSON()));
        return users;
    }

    fetchByIds(ids) {
        return this.loader.loadMany(ids);
    }

    fetchById(id) {
        return this.loader.load(id);
    }

    fetchAll() {
        return this.model.userRanks.findAll({});
    }
}

module.exports = UserRankConnector;
