/* eslint-disable no-magic-numbers */
'use strict';

const Controller = require('../core/controller.js');

const Page = class extends Controller {
    get modelName() {
        return 'pages';
    }

    async visit() {
        const { userId, username } = this.getUser();
        // console.log(this.getUser());
        const { url } = this.validate({ url: 'string' });

        const page = await this.model.pages.getByUrl(url);
        if (!page) this.throw(404);
        if (page.visibility && page.userId !== userId) return this.throw(411);

        const isReadable = await this.isReadable(userId, page.url, username);
        if (!isReadable) this.throw(401);

        await this.model.pages.visitor(page.id, userId);

        return this.success({ page });
    }

    async save() {
        const { userId } = this.authenticated();
        const { url } = this.validate({ url: 'string' });
        const paths = url.split('/').filter(o => o);
        if (paths.length < 2) return this.throw(400, '参数错误');
        const username = paths[0];
        const sitename = paths[1];

        const site = await this.model.sites.getByName(username, sitename);
        if (!site) return this.throw(400, '网站不存在');

        // 更新项目活跃度
        await this.model.contributions.addContributions(userId);

        // 更新对应项目更新时间
        await this.model.projects.update(
            { siteId: site.id },
            { where: { siteId: site.id } }
        );

        return this.success('OK');
    }
};

module.exports = Page;
