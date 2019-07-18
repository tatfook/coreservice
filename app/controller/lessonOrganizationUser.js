

const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const {
	CLASS_MEMBER_ROLE_STUDENT,
	CLASS_MEMBER_ROLE_TEACHER,
	CLASS_MEMBER_ROLE_ADMIN,
} = require("../core/consts.js");

const LessonOrganizationUser = class extends Controller {
	get modelName() {
		return "lessonOrganizationUsers";
	}
	

	async batchCreateUser() {
		const {userId, organizationId, roleId} = this.authenticated();
		const {classId, handlerId, count, prefix} = this.validate({classId: "number", count:"number", prefix:"string"});

		handlerId = handlerId || userId;

		if (roleId < CLASS_MEMBER_ROLE_TEACHER) return this.throw(400, "无权限操作");
		
		const handler = await this.ctx.service.user.getUserByUserId(handlerId);
		if (!handler) return this.throw(400, "负责人不存在");
		const cellphone = handler.cellphone;
	}
}

module.exports = LessonOrganizationUser;
