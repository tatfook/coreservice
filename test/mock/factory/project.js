module.exports = app => {
    const { factory } = app;
    const tableName = 'projects';
    factory.define(tableName, app.model[tableName], async options => {
        const user = options.user || (await factory.create('users'));
        return {
            userId: user.id,
            name: factory.chance('string', { length: 10 }),
            type: 1,
            visibility: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });
};
