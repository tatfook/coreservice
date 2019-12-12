'use strict';

const Axios = require('axios');

module.exports = app => {
    const Client = Axios.create({
        baseURL: app.config.self.marshalUrl,
    });

    const gitAPI = {
        async createRepo(username, name) {
            const result = await Client.post('/repos', {
                space: username, // use user name as space name
                name,
            });

            return result.data;
        },
        async getRepoInfo(repoPath) {
            const result = await Client.get('/repos', {
                params: { repoPath },
            });

            return result.data;
        },
        async getCommitInfo(repoPath, commitId, ref) {
            // 注: commitId 和 ref 同时存在时，commitId有效，ref无效
            const result = await Client.get('repos/commitInfo', {
                params: {
                    repoPath,
                    commitId,
                    ref,
                },
            });

            return result.data;
        },
        async deleteRepo(repoPath) {
            const result = await Client.delete('/repos', {
                data: { repoPath },
            });

            return result.data;
        },
        async downloadRepo(repoPath, ref) {
            const result = await Client.get('/repos/download', {
                params: {
                    repoPath,
                    ref,
                },
                responseType: 'stream',
            });

            return result.data;
        },
        async renameRepo(repoPath, newRepoName) {
            const result = await Client.post('/repos/rename', {
                repoPath,
                newRepoName,
            });

            return result.data;
        },
        async syncRepo(repoPath, gitlabRepoUrl) {
            const result = await Client.post('/repos/sync', {
                repoPath,
                gitlabRepoUrl,
            });

            return result.data;
        },
        async createFolder(repoPath, folderPath = '', committer) {
            const result = await Client.post('/folders', {
                repoPath,
                folderPath,
                committer,
            });

            return result.data;
        },
        async deleteFolder(repoPath, folderPath = '', committer) {
            const result = await Client.delete('/folders', {
                data: {
                    repoPath,
                    folderPath,
                    committer,
                },
            });

            return result.data;
        },
        async getFolderFiles(repoPath, folderPath = '', recursive, ref) {
            const result = await Client.get('/folders/files', {
                params: {
                    repoPath,
                    folderPath,
                    recursive,
                    ref,
                },
            });

            return result.data;
        },
        async moveFolder(repoPath, folderPath = '', newFolderPath) {
            const result = await Client.post('/folders/move', {
                repoPath,
                folderPath,
                newFolderPath,
            });

            return result.data;
        },
        // return commitId
        async upsertFile(repoPath, filePath, content, committer) {
            const result = await Client.post('/files', {
                repoPath,
                filePath,
                content,
                committer,
            });

            return result.data;
        },
        async deleteFile(repoPath, filePath, committer) {
            const result = await Client.delete('/files', {
                data: {
                    repoPath,
                    filePath,
                    committer,
                },
            });

            return result.data;
        },
        async getFileInfo(repoPath, filePath, commitId) {
            const result = await Client.get('/files', {
                params: {
                    repoPath,
                    filePath,
                    commitId,
                },
            });

            return result.data;
        },
        async getFileRaw(repoPath, filePath, commitId) {
            const result = await Client.get('/files/raw', {
                params: {
                    repoPath,
                    filePath,
                    commitId,
                },
            });

            return result.data;
        },
        async getFileHistory(repoPath, filePath, commitId) {
            const result = await Client.get('/files/history', {
                params: {
                    repoPath,
                    filePath,
                    commitId,
                },
            });

            return result.data;
        },
        async moveFile(repoPath, filePath, newFilePath, committer) {
            const result = await Client.post('/files/move', {
                repoPath,
                filePath,
                newFilePath,
                committer,
            });

            return result.data;
        },
    };

    return gitAPI;
};
