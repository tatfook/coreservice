const { app, assert } = require('egg-mock/bootstrap');
describe('test/controller/repo.test.js', () => {
    let user;
    let token;

    describe('#site', () => {
        let site;
        let repo;
        beforeEach(async () => {
            user = await app.login();
            token = user.token;
            site = await app.factory.create('sites', {}, { user });
            repo = await app.factory.create('repos', {
                username: site.username,
                repoName: site.sitename,
                resourceId: site.id,
                resourceType: 'Site',
                path: site.username + '/' + site.sitename,
            });
        });
        describe('#getTree', () => {
            it('should return file list for owner', async () => {
                const encodedPath = encodeURIComponent(repo.path);
                const result = await app
                    .httpRequest()
                    .get(`/api/v0/repos/${encodedPath}/tree`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200);
                assert(result.body);
                assert(result.body[0]);
            });
            it('should not return file list for stranger', async () => {
                const tmpUser = await app.login({ username: 'tmp' });
                token = tmpUser.token;
                const encodedPath = encodeURIComponent(repo.path);
                await app
                    .httpRequest()
                    .get(`/api/v0/repos/${encodedPath}/tree`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(403);
            });
        });
    });
});
