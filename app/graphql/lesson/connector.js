'use strict';
const DataLoader = require('dataloader');
const _ = require('lodash');

const { ENTITY_TYPE_PACKAGE } = require('../../core/consts.js');

class LessonConnector {
    constructor(ctx) {
        this.ctx = ctx;
        this.app = ctx.app;
        this.model = ctx.app.model;
        this.lessonModel = ctx.app.lessonModel;

        this.packageLessonCountLoader = new DataLoader(async ids => {
            const list = await ctx.lessonModel.query(
                'select count(*) count, packageId id from packageLessons where packageId in (:ids) group by packageId',
                {
                    type: ctx.lessonModel.QueryTypes.SELECT,
                    replacements: {
                        ids,
                    },
                }
            );
            return ids.map(
                id => (_.find(list, o => o.id === id) || { count: 0 }).count
            );
        });

        this.packageTagLoader = new DataLoader(async ids => {
            const list = await ctx.model.tags
                .findAll({
                    include: [
                        {
                            as: 'systemTags',
                            model: ctx.model.systemTags,
                        },
                    ],
                    where: {
                        objectId: { $in: ids },
                        objectType: ENTITY_TYPE_PACKAGE,
                    },
                })
                .then(list => list.map(o => o.toJSON()));

            return _.map(ids, id => {
                return list
                    .filter(o => o.objectId === id)
                    .map(o => o.systemTags);
            });
        });

        this.packageLoader = new DataLoader(async ids => {
            const list = await ctx.app.lessonModel.packages
                .findAll({ where: { id: { $in: ids } } })
                .then(list => list.map(o => o.toJSON()));
            return _.map(ids, id => _.find(list, o => o.id === id));
        });
        this.lessonLoader = new DataLoader(async ids => {
            const list = await ctx.app.lessonModel.lessons
                .findAll({ where: { id: { $in: ids } } })
                .then(list => list.map(o => o.toJSON()));
            return _.map(ids, id => _.find(list, o => o.id === id));
        });
        this.classroomLoader = new DataLoader(async ids => {
            const list = await ctx.app.lessonModel.classrooms
                .findAll({ where: { id: { $in: ids } } })
                .then(list => list.map(o => o.toJSON()));
            return _.map(ids, id => _.find(list, o => o.id === id));
        });
    }
}

module.exports = LessonConnector;
