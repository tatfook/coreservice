'use strict';
const Controller = require('../core/controller.js');
const { ENTITY_TYPE_PACKAGE } = require('../core/consts');

const Tag = class extends Controller {
    get modelName() {
        return 'tags';
    }

    // 获得这个tag下的课程包
    async getPackages() {
        const ctx = this.ctx;
        const id = ctx.query.id;

        await ctx.validate(this.app.validator.id, { id });

        const sysTag = await ctx.model.systemTags
            .findOne({ attributes: ['id', 'tagname'], where: { id } })
            .then(r => r && r.get());

        if (!sysTag) return this.success({});

        const list = await ctx.model.tags
            .findAll({
                where: {
                    tagId: id,
                    objectType: ENTITY_TYPE_PACKAGE,
                },
            })
            .then(list => list.map(o => o.toJSON()));
        const pkgIds = list.map(o => o.objectId);
        const packages = await ctx.app.api.lesson.getPackagesByCondition({
            id: { $in: pkgIds },
            state: 2,
        });

        return this.success({ ...sysTag, packages });
    }
};

module.exports = Tag;
