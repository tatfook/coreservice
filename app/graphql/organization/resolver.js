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
			const sql = `select count(*) as count from lessonOrganizationClassMembers where organizationId=:organizationId and roleId & :roleId`;
			const list = await ctx.model.query(sql, {
				type: ctx.model.QueryTypes.SELECT,
				replacements: {
					organizationId: root.id,
					roleId: CLASS_MEMBER_ROLE_STUDENT,
				}
			});
			return list[0].count;
		},

		async packages(root, args, ctx) {
			return await ctx.connector.organization.fetchOrganizationPackages(root.id);
		},

		async managers(root, args, ctx) {
			const sql = `select memberId from lessonOrganizationClassMembers where organizationId=:organizationId and roleId & :roleId and classId = 0`;
			const list = await ctx.model.query(sql, {
				type: ctx.model.QueryTypes.SELECT,
				replacements: {
					organizationId: root.id,
					roleId: CLASS_MEMBER_ROLE_ADMIN,
				}
			});

			if (list.length == 0) return [];

			const userIds = _.map(list, o => o.memberId);
			const users = await ctx.model.users.findAll({
				attributes: ["id", "username", "nickname", "portrait"],
				where:{id:{$in:userIds}}
			}).then(list => list.map(o => o.toJSON()));

			return users;
		},
	},

	OrganizationPackage: {

	},

	Package: {
	},

	Lesson: {

	},
};

