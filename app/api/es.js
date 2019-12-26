/* eslint-disable no-magic-numbers */
'use strict';
const Axios = require('axios');
const _ = require('lodash');

module.exports = app => {
    const esConfig = app.config.elasticsearch;
    const adminToken = esConfig.token;
    const Client = Axios.create({
        headers: {
            Authorization: adminToken,
        },
        baseURL: `${esConfig.url}`,
    });
    const getPageUrl = filePath => {
        return filePath.replace('.md', '');
    };
    const isMarkdownPage = filePath => {
        return _.endsWith(filePath, '.md');
    };
    const isInIgnoreList = filePath => {
        const ignorelist = esConfig.ingore_list;
        _.forEach(ignorelist, item => {
            if (_.endsWith(filePath, item)) return true;
        });
        return false;
    };

    const esAPI = {
        async upsertUser(user, transaction = null) {
            const userId = user.id;
            let [ userRank ] = await app.model.userRanks.findOrCreate({
                where: { userId },
                transaction,
            });
            userRank = userRank.get({ plain: true });
            return Client.post(`/users/${user.id}/upsert`, {
                id: user.id,
                username: user.username,
                portrait: user.portrait,
                description: user.description || '',
                total_projects: userRank.project,
                total_follows: userRank.follow,
                total_fans: userRank.fans,
                created_at: user.createdAt,
                updated_at: user.updatedAt,
            });
        },
        async deleteUser(id) {
            return await Client.delete(`/users/${id}`);
        },
        async upsertProject(project) {
            const user = await app.model.User.findOne({
                where: { id: project.userId },
            });

            if (!user || !user.realname) return; // 未实名用户的项目不能被查看，因此也不需被检索

            if (!project.systemTags) {
                const tags = await app.model.systemTagProjects.findAll({
                    where: {
                        projectId: project.id,
                    },
                });
                const tagIds = tags.map(tag => tag.systemTagId);
                project.systemTags = await app.model.systemTags.findAll({
                    where: {
                        id: {
                            [app.Sequelize.Op.in]: tagIds,
                        },
                    },
                });
            }
            let systemTags = [];
            project.systemTags &&
                (systemTags = project.systemTags.map(tag => tag.tagname));
            const body = {
                id: project.id,
                name: project.name,
                username: user.username,
                user_portrait: user.portrait,
                visibility: user.realname
                    ? project.visibility === 0
                        ? 'public'
                        : 'private'
                    : 'private',
                recruiting: !!(project.privilege & 1),
                type: project.type === 1 ? 'paracraft' : 'site',
                created_at: project.createdAt,
                cover: (project.extra || {}).imageUrl,
                description: project.description,
                total_like: project.star,
                total_view: project.visit,
                total_mark: project.favorite,
                total_comment: project.comment,
                recent_like: project.lastStar,
                recent_view: project.lastVisit,
                updated_at: project.updatedAt,
                video: (project.extra || {}).videoUrl,
                recommended: project.choicenessNo > 0,
                sys_tags: systemTags,
                point: project.rateCount < 8 ? undefined : project.rate,
                world_tag_name: (project.extra || {}).worldTagName,
            };
            return Client.post(`/projects/${project.id}/upsert`, body);
        },
        async deleteProject(id) {
            return await Client.delete(`/projects/${id}`);
        },
        async createPage(username, sitename, filePath, content, visibility) {
            if (!isMarkdownPage(filePath) || isInIgnoreList(filePath)) return;
            content = await app.api.keepwork.parseMarkdown(content);
            const url = getPageUrl(filePath);
            // title is the name of the file, eg: url -> space/repo/file, title -> file
            const splited_path = url.split('/');
            const title = splited_path[splited_path.length - 1];
            const datetime = new Date();

            return Client.post('/pages', {
                visibility,
                content,
                url,
                title,
                username,
                site: sitename,
                created_at: datetime,
                updated_at: datetime,
            });
        },
        async updatePage(filePath, content) {
            if (!isMarkdownPage(filePath) || isInIgnoreList(filePath)) return;
            content = await app.api.keepwork.parseMarkdown(content);
            const pageId = encodeURIComponent(getPageUrl(filePath));
            const datetime = new Date();
            return Client.put(`/pages/${pageId}`, {
                content,
                updated_at: datetime,
            });
        },
        async updateSiteVisibility(username, sitename, visibility) {
            return Client.put(`/sites/${username}/${sitename}/visibility`, {
                visibility,
            });
        },
        async deleteSite(username, sitename) {
            return Client.delete(`/sites/${username}/${sitename}`);
        },
        async deletePage(filePath) {
            if (!isMarkdownPage(filePath)) return;
            const pageId = encodeURIComponent(getPageUrl(filePath));
            return Client.delete(`/pages/${pageId}`);
        },

        async deleteFolder(repoName, username, folderPath) {
            return Client.delete(
                `/pages/${username}/${repoName}/folder/${folderPath}`
            );
        },

        async moveFolder(repoName, username, folderPath, newFolderPath) {
            return Client.post(`/sites/${username}/${repoName}/rename_folder`, {
                folder: folderPath,
                new_folder: newFolderPath,
            });
        },
    };

    return esAPI;
};
