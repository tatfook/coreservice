'use strict';

const Service = require('egg').Service;
const _ = require('lodash');
const uuid = require('uuid/v4');

class ESService extends Service {
    isInIgnoreList(filePath) {
        const esConfig = this.app.config.elasticsearch;
        const ignorelist = esConfig.ingore_list;
        const len = ignorelist.length;
        for (let i = 0; i < len; i++) {
            if (_.endsWith(filePath, ignorelist[i])) return true;
        }
        return false;
    }

    getLiteContentByContent(content = '') {
        // eslint-disable-next-line no-magic-numbers
        if (content.length > 150) {
            // eslint-disable-next-line no-magic-numbers
            return content.slice(0, 150) + '...';
        }
        return content;
    }

    async syncSitePages(site) {
        const { ctx, service, app } = this;

        const repo = await ctx.model.Repo.findOne({
            where: { resourceType: 'Site', resourceId: site.id },
        });
        const tree = await service.repo.getFolderFiles(repo.path, '', true);
        const bulkBody = [];
        const patchBulkBody = async file => {
            if (file.isTree) {
                file.children = file.children || [];
                for (let i = 0; i < file.children.length; i++) {
                    await patchBulkBody(file.children[i]);
                }
            } else if (
                _.endsWith(file.path, '.md') &&
                !this.isInIgnoreList(file.path)
            ) {
                const id = uuid();
                let content = await service.repo.getFileRaw(
                    repo.path,
                    file.path
                );
                content = await app.api.keepwork.parseMarkdown(
                    content.toString()
                );
                const info = await service.repo.getFileInfo(
                    repo.path,
                    file.path
                );
                bulkBody.push({ create: { _id: id } });
                bulkBody.push({
                    id,
                    url: _.replace(file.path, '.md', ''),
                    site: site.sitename,
                    username: site.username,
                    title: _.replace(file.name, '.md', ''),
                    visibility: 'public',
                    content,
                    lite_content: this.getLiteContentByContent(content),
                    created_at: info.date,
                    updated_at: info.date,
                });
            }
        };

        for (let i = 0; i < tree.length; i++) {
            await patchBulkBody(tree[i]);
        }

        if (bulkBody.length > 0) {
            await app.api.es.bulk({
                body: bulkBody,
                type: 'pages',
                index: 'pages',
            });
        }
    }

    async syncUsers(users) {
        const { app } = this;

        const bulkBody = [];
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const userId = user.id;
            let [ userRank ] = await app.model.userRanks.findOrCreate({
                where: { userId },
            });
            userRank = userRank.get({ plain: true });
            bulkBody.push({ create: { _id: userId } });
            bulkBody.push({
                id: userId,
                username: user.username,
                portrait: user.portrait,
                description: user.description || '',
                total_projects: userRank.project,
                total_follows: userRank.follow,
                total_fans: userRank.fans,
                created_at: user.createdAt,
                updated_at: user.updatedAt,
            });
        }

        if (bulkBody.length > 0) {
            await app.api.es.bulk({
                body: bulkBody,
                type: 'users',
                index: 'users',
            });
        }
    }
}

module.exports = ESService;
