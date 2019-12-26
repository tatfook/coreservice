module.exports = app => {
    const { factory } = app;
    const tableName = 'userinfos';

    factory.define(tableName, app.model[tableName], async options => {
        const user = options.user || (await app.factory.create('users'));
        return {
            name: user.username,
            userId: user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });
};
