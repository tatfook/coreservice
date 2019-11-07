module.exports = app => {
    const { factory } = app;
    const tableName = 'userRanks';

    factory.define(tableName, app.model[tableName], {
        userId: factory.assoc('users', 'id'),
        fans: factory.sequence('UserRank.fans', n => n),
        createdAt: new Date(),
        updatedAt: new Date(),
    });
};
