module.exports = app => {
    const { factory } = app;
    const tableName = 'applies';
    factory.define(tableName, app.model[tableName], async options => {
        const user = options.user || (await app.factory.create('users'));
        const project =
            options.project ||
            (await app.factory.create('projects', {}, { user }));

        return {
            applyId: user.id,
            applyType: 0,
            objectType: 5,
            objectId: project.id,
            userId: user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });
};
