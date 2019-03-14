'use strict';

const _ = require("lodash");

const {
	ENTITY_TYPE_ORGANIZATION,
	ENTITY_TYPE_ORGANIZATION_CLASS,

	CLASS_MEMBER_ROLE_ADMIN,
	CLASS_MEMBER_ROLE_STUDENT,
	CLASS_MEMBER_ROLE_TEACHER,
} = require("../../core/consts.js");

module.exports = {
	Organization: {
		async studentCount(root, _, ctx) {
			return await ctx.connector.organization.fetchOrganizationUserCount({
				organizationId: root.id, 
				roleId: CLASS_MEMBER_ROLE_STUDENT,
			});
		},

		async teacherCount(root, {}, ctx) {
			return await ctx.connector.organization.fetchOrganizationUserCount({
				organizationId: root.id, 
				roleId: CLASS_MEMBER_ROLE_TEACHER,
			});
		},

		async teachers(root, {}, ctx) {
			return await ctx.connector.organization.fetchOrganizationMembers({
				organizationId: root.id,
				roleId: CLASS_MEMBER_ROLE_TEACHER,
			});
		},

		async students(root, {}, ctx) {
			return await ctx.connector.organization.fetchOrganizationMembers({
				organizationId: root.id,
				roleId: CLASS_MEMBER_ROLE_STUDENT,
			});
		},

		async managers(root, args, ctx) {
			return await ctx.connector.organization.fetchOrganizationMembers({
				organizationId: root.id,
				classId: 0,
				roleId: CLASS_MEMBER_ROLE_ADMIN,
			});
		},

		async packages(root, args, ctx) {
			return await ctx.connector.organization.fetchOrganizationPackages({
				organizationId: root.id,
			});
		},

		async classes(root, {}, ctx) {
			return await ctx.connector.organization.fetchOrganizationClasses({
				organizationId: root.id,
			});
		}
	},

	OrganizationClass: {
		async studentCount(root, {}, ctx) {
			return await ctx.connector.organization.fetchOrganizationUserCount({
				organizationId: root.organizationId, 
				roleId: CLASS_MEMBER_ROLE_STUDENT,
				classId: root.id,
			});
		},

		async teacherCount(root, {}, ctx) {
			return await ctx.connector.organization.fetchOrganizationUserCount({
				organizationId: root.organizationId, 
				roleId: CLASS_MEMBER_ROLE_TEACHER,
				classId: root.id,
			});
		},

		async teachers(root, {}, ctx) {
			return await ctx.connector.organization.fetchOrganizationMembers({
				organizationId: root.organizationId, 
				roleId: CLASS_MEMBER_ROLE_TEACHER,
				classId: root.id,
			});
		},

		async students(root, {}, ctx) {
			return await ctx.connector.organization.fetchOrganizationMembers({
				organizationId: root.organizationId, 
				roleId: CLASS_MEMBER_ROLE_STUDENT,
				classId: root.id,
			});
		},

		async packages(root, args, ctx) {
			return await ctx.connector.organization.fetchOrganizationPackages({
				organizationId: root.organizationId,
				classId: root.id,
			});
		},
	},

	OrganizationPackage: {
		async package(root, {}, ctx) {
			return ctx.connector.organization.packageLoader.load(root.packageId);
		},

		async lessons(root, {}, ctx) {
			const lessonIds = _.map(root.lessons, o => o.lessonId);
			return ctx.connector.organization.lessonLoader.loadMany(lessonIds);
		},

		async learnedLessons(root, {}, ctx) {
			const {userId} = ctx.authenticated();
			return await ctx.connector.organization.fetchPackageLearned({userId, packageId});
		},

		async teachedLessons(root, {}, ctx) {
			return [];
		},
	},

	Package: {
		async lessons(root, {}, ctx) {
			const {userId} = ctx.authenticated();
			const pkgs = await ctx.model.lessonOrganizationPackages.findAll({
				include: [
				{
					as:"lessonOrganizationClassMembers",
					model: ctx.model.lessonOrganizationClassMembers,
					where: {
						memberId: userId,
					}
				}
				],
				where: {
					packageId: root.id,
				},
			});

			const lessonIds = [];
			_.each(pkgs, pkg => {
				_.each(pkg.lessons, l => lessonIds.push(l.lessonId));
			});

			return await ctx.connector.organization.lessonLoader.loadMany(lessonIds);
		},

		async learnedLessons(root, {}, ctx) {
			const {userId} = ctx.authenticated();
			return await ctx.connector.organization.fetchPackageLearned({userId, packageId});
		},

		async teachedLessons(root, {}, ctx) {
			return [];
		},
	},

	Lesson: {

	},
};

