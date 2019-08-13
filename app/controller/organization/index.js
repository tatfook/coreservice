
const _ = require("lodash");

const Controller = require("../../core/controller.js");

const {
	ENTITY_TYPE_ORGANIZATION,
	ENTITY_TYPE_ORGANIZATION_CLASS,

	CLASS_MEMBER_ROLE_ADMIN,
	CLASS_MEMBER_ROLE_STUDENT,
	CLASS_MEMBER_ROLE_TEACHER,
} = require("../../core/consts.js");

const Index = class extends Controller {
	// 更改密码 
	async changepwd() {
		let {userId, username, organizationId, roleId} = this.authenticated();
		const params = this.validate({classId:"number", memberId:"number", password:"string"});
		if (roleId < CLASS_MEMBER_ROLE_TEACHER) return this.throw(400, "无权限操作");
		if (roleId < CLASS_MEMBER_ROLE_ADMIN) {
			const teacher = await this.model.lessonOrganizationClassMembers.findOne({organizationId, classId: params.classId, memberId: userId});
			if (teacher.roleId < CLASS_MEMBER_ROLE_TEACHER) return this.throw(400);
		}
		
		const member = await this.model.lessonOrganizationClassMembers.findOne({organizationId, classId: params.classId, memberId: params.memberId})
		if (!member) return this.success(false);

		const ok = await ctx.model.users.update({
			password: app.util.md5(params.password),
		}, {where:{id: params.memberId}});

		ctx.model.lessonOrganizationLogs.create({
			memberId: params.memberId,
			username,
			handleId:userId,
		});

		return this.success(ok);
	}
}

module.exports = Index;
