module.exports = app => {
    const { factory } = app;
    const tableName = 'members';
    factory.define(tableName, app.model[tableName], async options => {
        const user = options.user || (await factory.create('users'));
        return {
            userId: user.id,
            objectType: 5, // project
            objectId: 1,
            memberId: user.id,
            level: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });
};
