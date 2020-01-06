module.exports = app => {
    const { factory } = app;
    const tableName = 'repos';

    factory.define(tableName, app.model[tableName], async () => {
        const username = await factory.chance('word', { length: 10 });
        const repoName = await factory.chance('word', { length: 10 });
        const path = username + '/' + repoName;

        return {
            username,
            repoName,
            path,
            resourceType: 'Site',
            resourceId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });
};
