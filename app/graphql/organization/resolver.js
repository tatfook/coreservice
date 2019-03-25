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

		async organizationManagers(root, args, ctx) {
			return await ctx.connector.organization.fetchOrganizationMembers({
				organizationId: root.id,
				classId: 0,
				roleId: CLASS_MEMBER_ROLE_ADMIN,
			});
		},

		async organizationPackages(root, args, ctx) {
			return await ctx.connector.organization.fetchOrganizationPackages({
				organizationId: root.id,
			});
		},

		async organizationClasses(root, {}, ctx) {
			return await ctx.connector.organization.fetchOrganizationClasses({
				organizationId: root.id,
			});
		}
	},

	OrganizationUser: {
		async userId(root, {userId, username}, ctx) {
			if (userId) return userId;
			const user = await ctx.connector.user.fetchByName(username);
			return (user || {}).id;
		},
		async classroom(root, {}, ctx) {
			return ctx.connector.organization.fetchCurrentClassroom({userId: root.userId});
		},
		async organizationClasses(root, {}, ctx) {
			return await ctx.connector.organization.fetchOrganizationClasses({
				organizationId: root.organizationId,
				memberId: root.userId,
			});
		},
		async organizationClassMembers(root, {}, ctx) {
			return await ctx.model.lessonOrganizationClassMembers.findAll({where: {
				organizationId: root.organizationId,
				memberId: root.userId,
			}}).then(list => list.map(o => o.toJSON()));
		},
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

		async organizationPackages(root, args, ctx) {
			return await ctx.connector.organization.fetchOrganizationPackages({
				organizationId: root.organizationId,
				classId: root.id,
			});
		},

		async classroom(root, args, ctx) {
			return await ctx.connector.organization.classroomLoader.load(root.id);
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

		async classrooms(root, {}, ctx) {
			const {userId} = ctx.authenticated();
			return await ctx.connector.organization.fetchClassrooms({
				userId,
				packageId: root.packageId,
				classId: root.classId,
			});
		},

		async lastTeachTime(root, {}, ctx) {
			const classroom = await ctx.lessonModel.classrooms.findOne({
				order:[["createdAt", "DESC"]],
				where: {classId: root.classId, packageId: root.packageId},
			}).then(o => o && o.toJSON());

			return classroom ? "" : classroom.createdAt;
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

