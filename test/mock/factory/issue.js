module.exports = app => {
    const { factory } = app;
    const tableName = 'issues';
    factory.define(tableName, app.model[tableName], async options => {
        const user = options.user || (await factory.create('users'));
        return {
            userId: user.id,
            objectType: factory.chance('integer', { enum: [ 0, 1, 2, 3, 5 ] }),
            objectId: factory.chance('integer'),
            title: factory.chance('word', { length: 10 }),
            state: factory.chance('integer', { enum: [ 0, 1 ] }),
            text: factory.chance('word', { length: 10 }),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });
};
