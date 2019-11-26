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
                data: {
                    repoPath,
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
                data: {
                    repoPath,
                    ref,
                },
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
        async createFolder(repoPath, folderPath = '', committer) {
            const result = await Client.get('/folders', {
                params: {
                    repoPath,
                    folderPath,
                    committer,
                },
            });

            return result.data;
        },
        async deleteFolder(repoPath, folderPath = '', committer) {
            const result = await Client.delete('/folders', {
                params: {
                    repoPath,
                    folderPath,
                    committer,
                },
            });

            return result.data;
        },
        async getFolderFiles(repoPath, folderPath = '', recursive) {
            const result = await Client.get('/folders/files', {
                params: {
                    repoPath,
                    folderPath,
                    recursive,
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