module.exports = app => {
    const { factory } = app;
    const tableName = 'gameWorks';
    factory.define(tableName, app.model[tableName], async options => {
        const game = options.game || (await factory.create('games'));
        const user = options.user || (await factory.create('users'));
        const project =
            options.project || (await factory.create('projects', {}, { user }));
        return {
            userId: user.id,
            gameId: game.id,
            projectId: project.id,
            worksName: factory.chance('string', { length: 10 }),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });
};
