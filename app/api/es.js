/* eslint-disable no-magic-numbers */
'use strict';
const Axios = require('axios');
const _ = require('lodash');

module.exports = app => {
    const config = app.config.self;
    const adminToken = app.util.jwt_encode(
        { userId: 1, username: 'coreservice', roleId: 10 },
        config.secret,
        3600 * 24 * 365 * 10
    );
    const Client = Axios.create({
        headers: {
            Authorization: 'Bearer ' + adminToken,
        },
        baseURL: `${config.esBaseURL}`,
    });
    const getPageUrl = filePath => {
        return filePath.replace('.md', '');
    };
    const isMarkdownPage = filePath => {
        return _.endsWith(filePath, '.md');
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

            if (!user.realname) return; // 未实名用户的项目不能被查看，因此也不需被检索

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
        async createPage(repo, filePath, content) {
            if (!isMarkdownPage(filePath)) return;
            content = await app.api.keepwork.parseMarkdown(content);
            const site = app.model.Site.findOne({
                where: { id: repo.resourceId },
            });
            const url = getPageUrl(filePath);

            return Client.post('/pages', {
                visibility: site.visibility,
                content,
                url,
            });
        },
        async updatePage(filePath, content) {
            if (!isMarkdownPage(filePath)) return;
            content = await app.api.keepwork.parseMarkdown(content);
            const pageId = encodeURIComponent(getPageUrl(filePath));
            return Client.put(`/pages/${pageId}`, {
                content,
            });
        },
        async updateSiteVisibility(repoPath, visibility) {
            const siteId = encodeURIComponent(repoPath);
            return Client.put(`/sites/${siteId}/visibility`, {
                visibility,
            });
        },
        async deleteSite(repoPath) {
            const siteId = encodeURIComponent(repoPath);
            return Client.delete(`/sites/${siteId}`);
        },
        async deletePage(filePath) {
            if (!isMarkdownPage(filePath)) return;
            const pageId = encodeURIComponent(getPageUrl(filePath));
            return Client.delete(`/pages/${pageId}`);
        },
        async movePage(repo, filePath, newFilePath, content) {
            if (!isMarkdownPage(filePath)) return;
            content = await app.api.keepwork.parseMarkdown(content);
            return Promise.all([
                this.deletePage(filePath),
                this.createPage(repo, newFilePath, content),
            ]);
        },
    };

    return esAPI;
};
