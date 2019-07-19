

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
		let {userId, organizationId, roleId} = this.authenticated();
		const params = this.validate({classId: "number", count:"number", prefix:"string"});
		if (params.organizationId && params.organizationId != organizationId) {
			organizationId = params.organizationId;
			roleId = await this.ctx.service.organization.getRoleId(organizationId, userId);
		}
		if (roleId < CLASS_MEMBER_ROLE_TEACHER) return this.throw(400, "无权限操作");

		let {classId, handlerId, count, prefix, password} = params;;
		handlerId = handlerId || userId;
		
		const handler = await this.ctx.service.user.getUserByUserId(handlerId);
		if (!handler) return this.throw(400, "负责人不存在");
		const cellphone = handler.realname;
		if (!cellphone) return this.throw(400, "负责人未实名");

		const userPrefix = await this.model.userPrefixs.findOne({where:{prefix}}).then(o => o && o.toJSON());
		const no = userPrefix ? userPrefix.no : 0;
		const userdatas = [];
		for (let i = 1; i <= count; i++) {
			const username = prefix + _.padStart(no + i, 4, "0");
			userdatas.push({
				username: username,
				nickname: username,
				password: this.app.util.md5(password || "123456"),
				realname: cellphone,
			});
		}
	
		if (userPrefix) {
			await this.model.userPrefixs.increment({no:count}, {where:{id: userPrefix.id}});
		} else {
			await this.model.userPrefixs.create({prefix, no: count, organizationId});
		}

		// 批量创建返回结果有 BUG
		let users = await this.model.users.bulkCreate(userdatas, {ignoreDuplicates: true}).then(list => list.map(o => o.toJSON()));
		const ids = users.filter(o => o.id).map(o => o.id);
		users = await this.model.users.findAll({
			attributes:["id","username"],
			where:{id:{"$in":ids}},
		}).then(list => list.map(o => o.toJSON()));

		const members = ids.map(id => ({
			memberId: id,
			classId,
			organizationId,
			roleId: CLASS_MEMBER_ROLE_STUDENT,
			bind:1,
		}));
		await this.model.lessonOrganizationClassMembers.bulkCreate(members);

		////const organizationUserdatas = users.map(o => ({
			////userId: o.id,
			////state:1,
			////organizationId,
			////classId,
			////handlerId,
			////cellphone,
		////}));
		
		////await this.model.lessonOrganizationUsers.bulkCreate(organizationUserdatas);

		return this.success(users);
	}

	async unbind() {
		let {userId, organizationId, roleId} = this.authenticated();
		const params = this.validate({classId: "number"});
		if (params.organizationId && params.organizationId != organizationId) {
			organizationId = params.organizationId;
			roleId = await this.ctx.service.organization.getRoleId(organizationId, userId);
		}
		if (roleId < CLASS_MEMBER_ROLE_TEACHER) return this.throw(400, "无权限操作");
		let {classId} = params;;
		const members = await this.model.lessonOrganizationClassMembers.findAll({where:{classId, organizationId, bind:1}}).then(list => list.map(o => o.toJSON()));
		await this.model.lessonOrganizationClassMembers.update({state: 0}, {where:{classId, organizationId, bind:1}});
		const ids = members.map(o => o.memberId);
		await this.model.users.update({realname:null}, {where:{id: {"$in": ids}}});
	
		//const users = await this.model.lessonOrganizationUsers.findAll({where:{classId, organizationId}}).then(list => list.map(o => o.toJSON()));
		//await this.model.lessonOrganizationUsers.update({state: 0}, {where:{classId, organizationId}});
		//const ids = users.map(o => o.userId);
		//await this.model.users.update({realname:null}, {where:{id: {"$in": ids}}});

		return this.success();
	}
}

module.exports = LessonOrganizationUser;
