module.exports = app => {
    const { factory } = app;
    const tableName = 'groups';

    factory.define(tableName, app.model[tableName], {
        userId: factory.sequence('Group.userId', n => n),
        groupname: factory.chance('string', { length: 10 }),
        description: factory.chance('string', { length: 10 }),
        createdAt: new Date(),
        updatedAt: new Date(),
    });
};
