module.exports = app => {
    const { factory } = app;
    const tableName = 'sites';

    factory.define(tableName, app.model[tableName], async options => {
        const user = options.user || (await factory.create('users'));
        return {
            userId: user.id,
            username: user.username,
            sitename: factory.chance('word', { length: 10 }),
            visibility: 1,
            description: factory.chance('string', { length: 10 }),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });
};
