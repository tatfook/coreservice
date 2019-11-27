module.exports = app => {
    const { factory } = app;
    const tableName = 'games';
    factory.define(tableName, app.model[tableName], {
        type: 0,
        name: factory.chance('string', { length: 10 }),
        no: 0,
        startDate: new Date().setDate(new Date().getDate() - 1),
        endDate: new Date().setDate(new Date().getDate() + 1),
        createdAt: new Date(),
        updatedAt: new Date(),
    });
};
