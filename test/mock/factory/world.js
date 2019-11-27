module.exports = app => {
    const { factory } = app;
    const tableName = 'worlds';
    factory.define(tableName, app.model[tableName], async options => {
        const user = options.user || (await factory.create('users'));
        const project =
            options.project || (await factory.create('projects', {}, { user }));
        return {
            projectId: project.id,
            userId: user.id,
            worldName: factory.chance('string', { length: 10 }),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });
};
