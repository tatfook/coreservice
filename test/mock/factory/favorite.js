module.exports = app => {
    const { factory } = app;
    const tableName = 'favorites';
    factory.define(tableName, app.model[tableName], async () => {
        return {
            userId: factory.sequence('Favorite.userId', n => n),
            objectId: factory.sequence('Favorite.objectId', n => n),
            objectType: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });
};
