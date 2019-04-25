
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const {
	ENTITY_TYPE_ORGANIZATION,
	ENTITY_TYPE_ORGANIZATION_CLASS,

	CLASS_MEMBER_ROLE_ADMIN,
	CLASS_MEMBER_ROLE_STUDENT,
	CLASS_MEMBER_ROLE_TEACHER,
} = require("../core/consts.js");

const LessonOrganizationClassMember = class extends Controller {
	get modelName() {
		return "lessonOrganizationClassMembers";
	}

	async teacher() {
		const {organizationId} = this.authenticated();

		const sql = `select memberId from lessonOrganizationClassMembers where organizationId = ${organizationId} and roleId & ${CLASS_MEMBER_ROLE_TEACHER} group by memberId`;
		const memberIds = await this.model.query(sql, {type:this.model.QueryTypes.SELECT}).then(list => _.map(list, o => o.memberId));
		if (memberIds.length == 0) return this.success([]);

		const list = await this.model.lessonOrganizationClassMembers.findAll({
			include: [
			{
				as: "users",
				attributes: ["id", "username", "nickname", "portrait"],
				model: this.model.users,
			},
			{
				as: "lessonOrganizationClasses",
				model: this.model.lessonOrganizationClasses,
				where: {
					//begin: {$lte: curtime},
					end: {$gte: curtime},
				},
				required: false,
			}
			],
			where: {
				organizationId,
				memberId: {
					[this.model.Op.in]: memberIds,
				}
			}
		}).then(list => list.map(o => o.toJSON()).filter(o => o.classId == 0 || o.lessonOrganizationClasses));
		const map = {};
		_.each(list, o => {
			if (!(o.roleId & CLASS_MEMBER_ROLE_TEACHER)) return;
			map[o.memberId] = map[o.memberId] || o;
			map[o.memberId].classes = map[o.memberId].classes || [];
			o.lessonOrganizationClasses && map[o.memberId].classes.push(o.lessonOrganizationClasses);
			map[o.memberId].username = o.users.username;
			map[o.memberId].realname = map[o.memberId].realname || o.realname;
			delete o.lessonOrganizationClasses;
		});
		const datas = [];
		_.each(map, o => datas.push(o));
		return this.success(datas);
	}

	async student() {
		const {organizationId} = this.authenticated();
		const {classId} = this.validate({classId:"number_optional"});
		const sql = `select memberId from lessonOrganizationClassMembers where organizationId = ${organizationId} and roleId & ${CLASS_MEMBER_ROLE_STUDENT} and classId ${classId ? ("=" + classId) : ("> 0")} group by memberId`;
		const memberIds = await this.model.query(sql, {type:this.model.QueryTypes.SELECT}).then(list => _.map(list, o => o.memberId));
		if (memberIds.length == 0) return this.success([]);
		const curtime = new Date();
		const list = await this.model.lessonOrganizationClassMembers.findAll({
			include: [
			{
				as: "users",
				attributes: ["id", "username", "nickname", "portrait"],
				model: this.model.users,
			},
			{
				as: "lessonOrganizationClasses",
				model: this.model.lessonOrganizationClasses,
				where: {
					//begin: {$lte: curtime},
					end: {$gte: curtime},
				},
				required: false,
			}
			],
			where: {
				organizationId,
				memberId: {$in: memberIds}
				//classId: classId ? classId : {$gt: 0},
				//roleId: CLASS_MEMBER_ROLE_STUDENT,
			},
		//}).then(list => list.map(o => o.toJSON()));
		}).then(list => list.map(o => o.toJSON()).filter(o => o.classId == 0 || o.lessonOrganizationClasses));
		const map = {};
		const rows = [];
		let count = 0;
		_.each(list, o => {
			if (!(o.roleId & CLASS_MEMBER_ROLE_STUDENT)) return;
			if (!map[o.memberId]) {
				count++;
				map[o.memberId] = o;
				o.classes = [];
				rows.push(o);
			}
			map[o.memberId].realname = map[o.memberId].realname || o.realname;
			o.lessonOrganizationClasses && map[o.memberId].classes.push(o.lessonOrganizationClasses);
			delete o.lessonOrganizationClasses;
		});
		_.each(rows, o => o.lessonOrganizationClasses = o.classes);
	
		return this.success({count, rows});
	}

	async bulkCreate() {
		return this.success();
		const {organizationId, roleId} = this.authenticated();
		const params = this.validate({roleId:"number"});
		const members = params.members || [];
		const memberIds = _.map(members, o => o.memberId);

		//const ok = await this.model.lessonOrganizationClassMembers.findOne({where:{organizationId: organizationId, memberId: {$in: memberIds}, roleId:{$ne: params.roleId}}});
		//if (ok)	return this.throw(400, "存在其它身份");

		if (!(roleId & CLASS_MEMBER_ROLE_ADMIN)) {
			if (roleId <= CLASS_MEMBER_ROLE_STUDENT)	return this.throw(411, "无权限");
			const organ = await this.model.lessonOrganizations.findOne({where:{id: organizationId}}).then(o => o && o.toJSON());
			if (!organ) return this.throw(500);
			if (organ.privilege && 1 == 0) return this.throw(411, "无权限");
		} 
		
		const datas = _.map(members, o => ({...o, organizationId, roleId: params.roleId}));
		await this.model.lessonOrganizationClassMembers.destroy({where:{organizationId, memberId: {$in: memberIds}}});
		const result = await this.model.lessonOrganizationClassMembers.bulkCreate(datas);

		return this.success(result);
	}

	async create() {
		const {organizationId, roleId} = this.authenticated();
		const params = this.validate();
		params.organizationId = organizationId;
		params.roleId = params.roleId || CLASS_MEMBER_ROLE_STUDENT;
		const classIds = _.uniq(params.classIds || []);

		if (!params.memberId) {
			if (!params.memberName) return this.throw(400);
			const user = await this.model.users.findOne({where:{username: params.memberName}}).then(o => o && o.toJSON());
			if (!user) return this.throw(400, "成员不存在");
			params.memberId = user.id;
		}
		//if (params.roleId >= roleId) return this.throw(411, "无权限");
		//const ok = await this.model.lessonOrganizationClassMembers.findOne({where:{organizationId: organizationId, memberId: params.memberId, roleId:{$ne: params.roleId}}});
		//if (ok)	return this.throw(400, "存在其它身份");

		if (!(roleId & CLASS_MEMBER_ROLE_ADMIN)) {
			if (roleId <= CLASS_MEMBER_ROLE_STUDENT)	return this.throw(411, "无权限");
			const organ = await this.model.lessonOrganizations.findOne({where:{id: organizationId}}).then(o => o && o.toJSON());
			if (!organ) return this.throw(500);
			if (organ.privilege && 1 == 0) return this.throw(411, "无权限");
		} 
		
		const oldmembers = await this.model.lessonOrganizationClassMembers.findAll({where:{organizationId, memberId: params.memberId}}).then(list => list.map(o => o.toJSON()));
		const organ = await this.model.lessonOrganizations.findOne({where:{id:organizationId}}).then(o => o.toJSON());
		if (!organ) return this.throw(400);
		const organCount = organ.count;
		const isStudent = _.find(oldmembers, o => o.roleId & CLASS_MEMBER_ROLE_STUDENT) ? true : false;
		if (!isStudent && (params.roleId & CLASS_MEMBER_ROLE_STUDENT)) {
			const usedCount = await this.model.lessonOrganizations.getUsedCount();
			if (usedCount >= organCount && classIds.length > 0) return this.fail(1, "学生人数已达上限");
		}

		// 合并其它身份
		const datas = _.map(classIds, classId => ({...params, classId, roleId: params.roleId | (_.find(oldmembers, m => m.classId == classId) || {roleId:0}).roleId}));
		// 删除要创建的
		classIds.length && await this.model.lessonOrganizationClassMembers.destroy({where:{organizationId, memberId: params.memberId, classId:{$in:classIds}}});
		// 取消全部班级此身份
		await this.model.query(`update lessonOrganizationClassMembers set roleId = roleId & ~${params.roleId} where organizationId = ${organizationId} and memberId = ${params.memberId}`, {type: this.model.QueryTypes.UPDATE});
		// 删除roleId=0为0的成员
		await this.model.lessonOrganizationClassMembers.destroy({where:{organizationId, memberId: params.memberId, roleId:0}});
		if (datas.length == 0) return this.success();
		const members = await this.model.lessonOrganizationClassMembers.bulkCreate(datas);
		return this.success(members);
	}
	
	async destroy() {
		const {organizationId, roleId} = this.authenticated();
		const {id} = this.validate({id: "number"});

		const member = await this.model.lessonOrganizationClassMembers.findOne({where:{organizationId, id}}).then(o => o && o.toJSON());
		if (member.roleId >= roleId) return this.throw(411);

		if (roleId < CLASS_MEMBER_ROLE_ADMIN) {
			if (roleId <= CLASS_MEMBER_ROLE_STUDENT)	return this.throw(411, "无权限");
			const organ = await this.model.lessonOrganizations.findOne({where:{id: organizationId}}).then(o => o && o.toJSON());
			if (!organ) return this.throw(500);
			if (organ.privilege && 2 == 0) return this.throw(411, "无权限");
		} 
		
		await this.model.lessonOrganizationClassMembers.destroy({where:{id}});

		return this.success("OK");
	}

	// 禁止更新
	async update() {
	}
}

module.exports = LessonOrganizationClassMember;
