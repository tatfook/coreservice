module.exports = app => {
    const { factory } = app;
    const tableName = 'sites';

    factory.define(tableName, app.model[tableName], {
        userId: factory.sequence('Site.userId', n => n),
        sitename: factory.chance('string', { length: 10 }),
        visibility: 1,
        description: factory.chance('string', { length: 10 }),
        createdAt: new Date(),
        updatedAt: new Date(),
    });
};
