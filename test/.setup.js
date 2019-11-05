const { app, mock, assert } = require('egg-mock/bootstrap');
const _ = require('lodash');
const Chance = require('chance');
const loader = require('./setup/loader.js');

before(async () => {
    loader(app);
    app.chance = new Chance();
    await truncateAllTables();
});

async function truncateAllTables() {
    const keepworkTables = await app.model
        .query(`show tables`, { type: app.model.QueryTypes.SHOWTABLES })
        .then(list => _.filter(list, o => o != 'SequelizeMeta'));
    const opts = { restartIdentity: true, cascade: true };
    const list = [];
    _.each(keepworkTables, tableName =>
        list.push(app.model[tableName] && app.model[tableName].truncate(opts))
    );
    const lessonTables = await app.lessonModel
        .query(`show tables`, { type: app.lessonModel.QueryTypes.SHOWTABLES })
        .then(list => _.filter(list, o => o != 'SequelizeMeta'));
    _.each(lessonTables, tableName =>
        list.push(
            app.lessonModel[tableName] &&
                app.lessonModel[tableName].truncate(opts)
        )
    );
    list.push(app.redis.flushdb());
    await Promise.all(list);
}

afterEach(async () => {
    await truncateAllTables();
});
