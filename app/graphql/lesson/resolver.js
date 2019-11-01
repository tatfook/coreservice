/* eslint-disable no-empty-pattern */

'use strict';

const _ = require('lodash');

module.exports = {
    Package: {
        async tags(root, {}, ctx) {
            return await ctx.connector.lesson.packageTagLoader.load(root.id);
        },

        async lessonCount(root, {}, ctx) {
            // return await ctx.lessonModel.packageLessons.count({where:{packageId:root.id}});
            return await ctx.connector.lesson.packageLessonCountLoader.load(
                root.id
            );
        },

        async lessons(root, {}, ctx) {
            const { userId } = ctx.authenticated();
            const pkgs = await ctx.model.lessonOrganizationPackages.findAll({
                include: [
                    {
                        as: 'lessonOrganizationClassMembers',
                        model: ctx.model.lessonOrganizationClassMembers,
                        where: {
                            memberId: userId,
                        },
                    },
                ],
                where: {
                    packageId: root.id,
                },
            });

            const lessonIds = [];
            _.each(pkgs, pkg => {
                _.each(pkg.lessons, l => lessonIds.push(l.lessonId));
            });

            return await ctx.connector.organization.lessonLoader.loadMany(
                lessonIds
            );
        },

        async learnedLessons() {
            // const { userId } = ctx.authenticated();
            // return await ctx.connector.organization.fetchPackageLearned({
            //     userId,
            //     packageId,
            // });
        },

        async teachedLessons() {
            return [];
        },

        // async authUserLessonIds(root, {}, ctx) {
        // const userId = ctx.state.user.userId;
        // if (!userId) return [];
        // const list = ctx.model.lessonOrganizationPackages({
        // include:[
        // {
        // as:"lessonOrganizationClassMembers",
        // model: ctx.model.lessonOrganizationClassMembers,
        // where: {
        // memberId: userId,
        // }
        // },
        // ],
        // where: {
        // packageId: root.id,
        // },
        // }).then(list => list.map(o => o.toJSON()));
        // },
    },

    Lesson: {
        async authUserPrivilege(root, {}, ctx) {
            const userId = ctx.state.user.userId;
            if (!userId) return 0;
            const pkgs = await ctx.connector.organization.fetchUserPackages(
                userId
            );
            const lessonId = root.id;
            const pkg = await _.find(pkgs, o => {
                if (root.packageId && root.packageId !== o.packageId) {
                    return false;
                }
                return _.find(o.lessons, l => l.lessonId === lessonId);
            });
            return pkg ? 1 : 0;
        },
        async organizations(root, {}, ctx) {
            const list = await ctx.connector.organization.fetchOrganizationsByLessonId(
                root.id
            );
            if (!root.packageId) return list;
            return _.filter(list, o =>
                _.find(o.lessonOrganizationPackages, x => {
                    return (
                        x.packageId === root.packageId &&
                        _.find(x.lessons, l => l.lessonId === root.id)
                    );
                })
            );
        },
    },
};
