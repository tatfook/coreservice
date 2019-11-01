/* eslint-disable no-empty-pattern */

'use strict';

const { ENTITY_TYPE_PACKAGE } = require('../../core/consts.js');

module.exports = {
    Tag: {
        async packages(root, {}, ctx) {
            const list = await ctx.model.tags
                .findAll({
                    where: {
                        tagId: root.id,
                        objectType: ENTITY_TYPE_PACKAGE,
                    },
                })
                .then(list => list.map(o => o.toJSON()));
            const pkgIds = list.map(o => o.objectId);
            const pkgs = await ctx.lessonModel.packages
                .findAll({ where: { id: { $in: pkgIds }, state: 2 } })
                .then(list => list.map(o => o.toJSON()));
            return pkgs;
        },
    },
};
