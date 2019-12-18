const { app, assert } = require('egg-mock/bootstrap');
describe('test/controller/repo.test.js', () => {
    let user;
    let token;

    describe('#site public', () => {
        let site;
        let repo;
        beforeEach(async () => {
            user = await app.login();
            token = user.token;
            site = await app.factory.create(
                'sites',
                { visibility: 0 },
                { user }
            );
            repo = await app.factory.create('repos', {
                username: site.username,
                repoName: site.sitename,
                resourceId: site.id,
                resourceType: 'Site',
                path: site.username + '/' + site.sitename,
            });
        });
        describe('repo', () => {
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
                it('should return file list for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/tree`)
                        .set('Authorization', `Bearer ${token}`);
                    assert(result.body);
                    assert(result.body[0]);
                });
                it('should return file list for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/tree`)
                        .expect(200);
                    assert(result.body);
                    assert(result.body[0]);
                });
                it('should not return file list for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/tree`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#download', () => {
                it('should return zip data for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/download`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should return zip data for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/download`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should return zip data for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/download`)
                        .expect(200);
                    assert(result.body);
                });
                it('should not return zip data with invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/download`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#getCommitInfo', () => {
                it('should return commit info for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/commitInfo`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should return commit info with commitId', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/commitInfo`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({
                            commitId:
                                'a03c42e2b15a802638adbcb730dd15c8a3afe528',
                        })
                        .expect(200);
                    assert(result.body);
                });
                it('should return commit info with ref', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/commitInfo`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({
                            ref: 'master',
                        })
                        .expect(200);
                    assert(result.body);
                });
                it('should return commit info for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/commitInfo`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should return commit info for vistor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/commitInfo`)
                        .expect(200);
                    assert(result.body);
                });
                it('should not return commit info with invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/commitInfo`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
        });
        describe('file', () => {
            describe('#getFileInfo', () => {
                it('should return file info for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/info`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                    assert(result.body.id);
                });
                it('should return file info for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/info`
                        )
                        .set('Authorization', `Bearer ${token}`);
                    assert(result.body);
                    assert(result.body.id);
                });
                it('should return file info for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/info`
                        );
                    assert(result.body);
                    assert(result.body.id);
                });
                it('should not return file info for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/info`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#getFileRaw', () => {
                it('should return file raw data for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/raw`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should not return file raw data for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/raw`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should not return file raw data for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/raw`
                        )
                        .expect(200);
                    assert(result.body);
                });
                it('should not return file raw data for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/raw`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#getFileHistory', () => {
                it('should return file history for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/history`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                    assert(result.body[0]);
                });
                it('should not return file history for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/history`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should not return file history for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/history`
                        )
                        .expect(403);
                });
                it('should not return file history for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/history`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#createFile', () => {
                it('should create successfully for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should create successfully with empty content', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: '' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should failed for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should failed for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .expect(403);
                });
                it('should failed for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#updateFile', () => {
                it('should update successfully for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .put(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should failed for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .put(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should failed for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .put(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .expect(403);
                });
                it('should failed for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .put(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#deleteFile', () => {
                it('should delete successfully for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .delete(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should failed for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .delete(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should failed for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .delete(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .expect(403);
                });
                it('should failed for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .delete(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#renameFile', () => {
                it('should rename successfully for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const newFilePath = 'test2/abc.md';
                    const result = await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/rename`
                        )
                        .send({ newFilePath })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should failed without newFilePath', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/rename`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(400);
                });
                it('should failed for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const newFilePath = 'test2/abc.md';
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/rename`
                        )
                        .send({ newFilePath })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should failed for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const newFilePath = 'test2/abc.md';
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/rename`
                        )
                        .send({ newFilePath })
                        .expect(403);
                });
                it('should failed for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const newFilePath = 'test2/abc.md';
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/rename`
                        )
                        .send({ newFilePath })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
        });
        describe('folder', () => {
            describe('#createFolder', () => {
                it('should create folder for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFolderPath = encodeURIComponent('test/abc');
                    const result = await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should failed to create folder for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFolderPath = encodeURIComponent('test/abc');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should failed to create folder for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFolderPath = encodeURIComponent('test/abc');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
                        )
                        .expect(403);
                });
                it('should failed to create folder for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFolderPath = encodeURIComponent('test/abc');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            // describe('#deleteFolder', () => {
            //     it('should delete folder for owner', async () => {
            //         const encodedPath = encodeURIComponent(repo.path);
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         const result = await app
            //             .httpRequest()
            //             .delete(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
            //             )
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(200);
            //         assert(result.body);
            //     });
            //     it('should failed to delete folder for stranger', async () => {
            //         const tmpUser = await app.login({ username: 'tmp' });
            //         token = tmpUser.token;
            //         const encodedPath = encodeURIComponent(repo.path);
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         await app
            //             .httpRequest()
            //             .delete(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
            //             )
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(403);
            //     });
            //     it('should failed to delete folder for invalid repo path', async () => {
            //         const encodedPath = encodeURIComponent(repo.path + 'abc');
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         await app
            //             .httpRequest()
            //             .delete(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
            //             )
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(404);
            //     });
            // });
            // describe('#renameFolder', () => {
            //     it('should rename folder for owner', async () => {
            //         const encodedPath = encodeURIComponent(repo.path);
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         const newFolderPath = 'test2/abc';
            //         const result = await app
            //             .httpRequest()
            //             .post(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}/rename`
            //             )
            //             .send({ newFolderPath })
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(200);
            //         assert(result.body);
            //     });
            //     it('should failed to rename if new path is empty', async () => {
            //         const encodedPath = encodeURIComponent(repo.path);
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         await app
            //             .httpRequest()
            //             .post(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}/rename`
            //             )
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(400);
            //     });
            //     it('should failed to delete folder for stranger', async () => {
            //         const tmpUser = await app.login({ username: 'tmp' });
            //         token = tmpUser.token;
            //         const encodedPath = encodeURIComponent(repo.path);
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         const newFolderPath = 'test2/abc';
            //         await app
            //             .httpRequest()
            //             .post(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}/rename`
            //             )
            //             .send({ newFolderPath })
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(403);
            //     });
            //     it('should failed to delete folder for invalid repo path', async () => {
            //         const encodedPath = encodeURIComponent(repo.path + 'abc');
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         const newFolderPath = 'test2/abc';
            //         await app
            //             .httpRequest()
            //             .post(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}/rename`
            //             )
            //             .send({ newFolderPath })
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(404);
            //     });
            // });
        });
    });

    describe('#site private', () => {
        let site;
        let repo;
        beforeEach(async () => {
            user = await app.login();
            token = user.token;
            site = await app.factory.create(
                'sites',
                { visibility: 1 },
                { user }
            );
            repo = await app.factory.create('repos', {
                username: site.username,
                repoName: site.sitename,
                resourceId: site.id,
                resourceType: 'Site',
                path: site.username + '/' + site.sitename,
            });
        });
        describe('repo', () => {
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
                it('should not return file list for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/tree`)
                        .expect(403);
                });
                it('should not return file list for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/tree`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#download', () => {
                it('should return zip data for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/download`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should not return zip data for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/download`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should not return zip data for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/download`)
                        .expect(403);
                });
                it('should not return zip data with invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/download`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#getCommitInfo', () => {
                it('should return commit info for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/commitInfo`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should return commit info with commitId', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/commitInfo`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({
                            commitId:
                                'a03c42e2b15a802638adbcb730dd15c8a3afe528',
                        })
                        .expect(200);
                    assert(result.body);
                });
                it('should return commit info with ref', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/commitInfo`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({
                            ref: 'master',
                        })
                        .expect(200);
                    assert(result.body);
                });
                it('should not return commit info for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/commitInfo`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should not return commit info for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/commitInfo`)
                        .expect(403);
                });
                it('should not return commit info with invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/commitInfo`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
        });
        describe('file', () => {
            describe('#getFileInfo', () => {
                it('should return file info for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/info`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                    assert(result.body.id);
                });
                it('should not return file info for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/info`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should not return file info for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/info`
                        )
                        .expect(403);
                });
                it('should not return file info for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/info`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#getFileRaw', () => {
                it('should return file raw data for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/raw`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should not return file raw data for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/raw`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should not return file raw data for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/raw`
                        )
                        .expect(403);
                });
                it('should not return file raw data for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/raw`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#getFileHistory', () => {
                it('should return file history for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/history`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                    assert(result.body[0]);
                });
                it('should not return file history for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/history`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should not return file history for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/history`
                        )
                        .expect(403);
                });
                it('should not return file history for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/history`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#createFile', () => {
                it('should create successfully for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should create successfully with empty content', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: '' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should failed for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should failed for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .expect(403);
                });
                it('should failed for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#updateFile', () => {
                it('should update successfully for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .put(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should failed for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .put(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should failed for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .put(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .expect(403);
                });
                it('should failed for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .put(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#deleteFile', () => {
                it('should delete successfully for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .delete(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should failed for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .delete(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should failed for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .delete(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .expect(403);
                });
                it('should failed for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .delete(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#renameFile', () => {
                it('should rename successfully for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const newFilePath = 'test2/abc.md';
                    const result = await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/rename`
                        )
                        .send({ newFilePath })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should failed without newFilePath', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/rename`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(400);
                });
                it('should failed for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const newFilePath = 'test2/abc.md';
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/rename`
                        )
                        .send({ newFilePath })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should failed for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const newFilePath = 'test2/abc.md';
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/rename`
                        )
                        .send({ newFilePath })
                        .expect(403);
                });
                it('should failed for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const newFilePath = 'test2/abc.md';
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/rename`
                        )
                        .send({ newFilePath })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
        });
        describe('folder', () => {
            describe('#createFolder', () => {
                it('should create folder for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFolderPath = encodeURIComponent('test/abc');
                    const result = await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should failed to create folder for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFolderPath = encodeURIComponent('test/abc');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should failed to create folder for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFolderPath = encodeURIComponent('test/abc');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
                        )
                        .expect(403);
                });
                it('should failed to create folder for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFolderPath = encodeURIComponent('test/abc');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            // describe('#deleteFolder', () => {
            //     it('should delete folder for owner', async () => {
            //         const encodedPath = encodeURIComponent(repo.path);
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         const result = await app
            //             .httpRequest()
            //             .delete(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
            //             )
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(200);
            //         assert(result.body);
            //     });
            //     it('should failed to delete folder for stranger', async () => {
            //         const tmpUser = await app.login({ username: 'tmp' });
            //         token = tmpUser.token;
            //         const encodedPath = encodeURIComponent(repo.path);
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         await app
            //             .httpRequest()
            //             .delete(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
            //             )
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(403);
            //     });
            //     it('should failed to delete folder for invalid repo path', async () => {
            //         const encodedPath = encodeURIComponent(repo.path + 'abc');
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         await app
            //             .httpRequest()
            //             .delete(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
            //             )
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(404);
            //     });
            // });
            // describe('#renameFolder', () => {
            //     it('should rename folder for owner', async () => {
            //         const encodedPath = encodeURIComponent(repo.path);
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         const newFolderPath = 'test2/abc';
            //         const result = await app
            //             .httpRequest()
            //             .post(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}/rename`
            //             )
            //             .send({ newFolderPath })
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(200);
            //         assert(result.body);
            //     });
            //     it('should failed to rename if new path is empty', async () => {
            //         const encodedPath = encodeURIComponent(repo.path);
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         await app
            //             .httpRequest()
            //             .post(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}/rename`
            //             )
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(400);
            //     });
            //     it('should failed to delete folder for stranger', async () => {
            //         const tmpUser = await app.login({ username: 'tmp' });
            //         token = tmpUser.token;
            //         const encodedPath = encodeURIComponent(repo.path);
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         const newFolderPath = 'test2/abc';
            //         await app
            //             .httpRequest()
            //             .post(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}/rename`
            //             )
            //             .send({ newFolderPath })
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(403);
            //     });
            //     it('should failed to delete folder for invalid repo path', async () => {
            //         const encodedPath = encodeURIComponent(repo.path + 'abc');
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         const newFolderPath = 'test2/abc';
            //         await app
            //             .httpRequest()
            //             .post(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}/rename`
            //             )
            //             .send({ newFolderPath })
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(404);
            //     });
            // });
        });
    });

    describe('#world', () => {
        let world;
        let repo;
        beforeEach(async () => {
            user = await app.login();
            token = user.token;
            world = await app.factory.create('worlds', {}, { user });
            repo = await app.factory.create('repos', {
                username: user.username,
                repoName: world.worldName,
                resourceId: world.id,
                resourceType: 'World',
                path: world.username + '/' + world.worldName,
            });
        });
        describe('repo', () => {
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
                it('should return file list for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/tree`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                    assert(result.body[0]);
                });
                it('should not return file list for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/tree`)
                        .expect(403);
                });
                it('should not return file list for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/tree`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#download', () => {
                it('should return zip data for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/download`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should return zip data for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/download`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should not return zip data for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/download`)
                        .expect(403);
                });
                it('should not return zip data for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/download`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#getCommitInfo', () => {
                it('should return commit info for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/commitInfo`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should return commit info for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/commitInfo`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should not return commit info for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/commitInfo`)
                        .expect(403);
                });
                it('should return commit info with commitId', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/commitInfo`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({
                            commitId:
                                'a03c42e2b15a802638adbcb730dd15c8a3afe528',
                        })
                        .expect(200);
                    assert(result.body);
                });
                it('should return commit info with ref', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const result = await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/commitInfo`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({
                            ref: 'master',
                        })
                        .expect(200);
                    assert(result.body);
                });
                it('should not return commit info with invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    await app
                        .httpRequest()
                        .get(`/api/v0/repos/${encodedPath}/commitInfo`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
        });
        describe('file', () => {
            describe('#getFileInfo', () => {
                it('should return file info for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/info`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                    assert(result.body.id);
                });
                it('should return file info for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/info`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                    assert(result.body.id);
                });
                it('should not return file info for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/info`
                        )
                        .expect(403);
                });
                it('should not return file info for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/info`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#getFileRaw', () => {
                it('should return file raw data for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/raw`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should return file raw data for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/raw`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should not return file raw data for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/raw`
                        )
                        .expect(403);
                });
                it('should not return file raw data for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/raw`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#getFileHistory', () => {
                it('should return file history for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/history`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                    assert(result.body[0]);
                });
                it('should not return file history for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/history`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should not return file history for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/history`
                        )
                        .expect(403);
                });
                it('should not return file history for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .get(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/history`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#createFile', () => {
                it('should create successfully for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should create successfully with encoding', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test', encoding: 'utf8' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should failed for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should failed for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .expect(403);
                });
                it('should failed for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#updateFile', () => {
                it('should update successfully for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .put(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should update successfully with encoding', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .put(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test', encoding: 'utf8' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should failed for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .put(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should failed for visitor', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .put(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .expect(403);
                });
                it('should failed for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .put(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .send({ content: 'test' })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#deleteFile', () => {
                it('should delete successfully for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const result = await app
                        .httpRequest()
                        .delete(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should failed for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .delete(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should failed for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .delete(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            describe('#renameFile', () => {
                it('should rename successfully for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const newFilePath = 'test2/abc.md';
                    const result = await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/rename`
                        )
                        .send({ newFilePath })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should failed without newFilePath', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/rename`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(400);
                });
                it('should failed for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const newFilePath = 'test2/abc.md';
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/rename`
                        )
                        .send({ newFilePath })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should failed for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFilePath = encodeURIComponent('test/abc.md');
                    const newFilePath = 'test2/abc.md';
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/files/${encodedFilePath}/rename`
                        )
                        .send({ newFilePath })
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
        });
        describe('folder', () => {
            describe('#createFolder', () => {
                it('should create folder for owner', async () => {
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFolderPath = encodeURIComponent('test/abc');
                    const result = await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200);
                    assert(result.body);
                });
                it('should failed to create folder for stranger', async () => {
                    const tmpUser = await app.login({ username: 'tmp' });
                    token = tmpUser.token;
                    const encodedPath = encodeURIComponent(repo.path);
                    const encodedFolderPath = encodeURIComponent('test/abc');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(403);
                });
                it('should failed to create folder for invalid repo path', async () => {
                    const encodedPath = encodeURIComponent(repo.path + 'abc');
                    const encodedFolderPath = encodeURIComponent('test/abc');
                    await app
                        .httpRequest()
                        .post(
                            `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
                        )
                        .set('Authorization', `Bearer ${token}`)
                        .expect(404);
                });
            });
            // describe('#deleteFolder', () => {
            //     it('should delete folder for owner', async () => {
            //         const encodedPath = encodeURIComponent(repo.path);
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         const result = await app
            //             .httpRequest()
            //             .delete(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
            //             )
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(200);
            //         assert(result.body);
            //     });
            //     it('should failed to delete folder for stranger', async () => {
            //         const tmpUser = await app.login({ username: 'tmp' });
            //         token = tmpUser.token;
            //         const encodedPath = encodeURIComponent(repo.path);
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         await app
            //             .httpRequest()
            //             .delete(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
            //             )
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(403);
            //     });
            //     it('should failed to delete folder for invalid repo path', async () => {
            //         const encodedPath = encodeURIComponent(repo.path + 'abc');
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         await app
            //             .httpRequest()
            //             .delete(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}`
            //             )
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(404);
            //     });
            // });
            // describe('#renameFolder', () => {
            //     it('should rename folder for owner', async () => {
            //         const encodedPath = encodeURIComponent(repo.path);
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         const newFolderPath = 'test2/abc';
            //         const result = await app
            //             .httpRequest()
            //             .post(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}/rename`
            //             )
            //             .send({ newFolderPath })
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(200);
            //         assert(result.body);
            //     });
            //     it('should failed to rename if new path is empty', async () => {
            //         const encodedPath = encodeURIComponent(repo.path);
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         await app
            //             .httpRequest()
            //             .post(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}/rename`
            //             )
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(400);
            //     });
            //     it('should failed to delete folder for stranger', async () => {
            //         const tmpUser = await app.login({ username: 'tmp' });
            //         token = tmpUser.token;
            //         const encodedPath = encodeURIComponent(repo.path);
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         const newFolderPath = 'test2/abc';
            //         await app
            //             .httpRequest()
            //             .post(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}/rename`
            //             )
            //             .send({ newFolderPath })
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(403);
            //     });
            //     it('should failed to delete folder for invalid repo path', async () => {
            //         const encodedPath = encodeURIComponent(repo.path + 'abc');
            //         const encodedFolderPath = encodeURIComponent('test/abc');
            //         const newFolderPath = 'test2/abc';
            //         await app
            //             .httpRequest()
            //             .post(
            //                 `/api/v0/repos/${encodedPath}/folders/${encodedFolderPath}/rename`
            //             )
            //             .send({ newFolderPath })
            //             .set('Authorization', `Bearer ${token}`)
            //             .expect(404);
            //     });
            // });
        });
    });
});
