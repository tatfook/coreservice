module.exports = app => {
    const { factory } = app;
    const tableName = 'worlds';

    factory.define(tableName, app.model[tableName], async options => {
        const user = options.user || (await factory.create('users'));
        const project = options.project || (await factory.create('projects'));
        return {
            userId: user.id,
            projectId: project.id,
            worldName: factory.chance('word', { length: 10 }),

            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });
};
