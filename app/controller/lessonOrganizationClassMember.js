
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
			}
			],
			where: {
				organizationId,
				memberId: {
					[this.model.Op.in]: memberIds,
				}
			}
		}).then(list => _.map(list, o => o.toJSON()));
		console.log(list);
		const map = {};
		_.each(list, o => {
			map[o.memberId] = map[o.memberId] || o;
			map[o.memberId].classes = map[o.memberId].classes || [];
			map[o.memberId].classes.push(o.lessonOrganizationClasses);
			map[o.memberId].username = o.users.username;
			delete o.lessonOrganizationClasses;
		});
		const datas = [];
		_.each(map, o => datas.push(o));
		return this.success(datas);
	}

	async student() {
		const {organizationId} = this.authenticated();
		const {classId} = this.validate({classId:"number_optional"});
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
			}
			],
			where: {
				organizationId,
				classId: classId ? classId : {$gt: 0},
				roleId: CLASS_MEMBER_ROLE_STUDENT,
			},
		}).then(list => list.map(o => o.toJSON()));
		const map = {};
		const rows = [];
		let count = 0;
		_.each(list, member => {
			if (map[member.memberId]) {
				map[member.memberId].lessonOrganizationClasses.push(member.lessonOrganizationClasses);
			} else {
				count++;
				map[member.memberId] = member;
				member.lessonOrganizationClasses = [member.lessonOrganizationClasses];
				rows.push(member);
			}
		});
	
		return this.success({count, rows});
	}

	async getOrganizationTeacherAndStudentCount({organizationId}) {
		const sql = `select count(*) as count from (select * from lessonOrganizationClassMembers where organizationId = ${organizationId} and classId > 0 group by memberId) as alias`;
		const list = await this.model.query(sql, {type:this.model.QueryTypes.SELECT});
		return list[0].count || 0;
	}

	async bulkCreate() {
		const {organizationId, roleId} = this.authenticated();
		const params = this.validate({roleId:"number"});
		const members = params.members || [];
		const memberIds = _.map(members, o => o.memberId);

		//const ok = await this.model.lessonOrganizationClassMembers.findOne({where:{organizationId: organizationId, memberId: {$in: memberIds}, roleId:{$ne: params.roleId}}});
		//if (ok)	return this.throw(400, "存在其它身份");

		if (roleId < CLASS_MEMBER_ROLE_ADMIN) {
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

		if (!params.memberId) {
			if (!params.memberName) return this.throw(400);
			const user = await this.model.users.findOne({where:{username: params.memberName}}).then(o => o && o.toJSON());
			if (!user) return this.throw(400, "成员不存在");
			params.memberId = user.id;
		}
		if (params.roleId >= roleId) return this.throw(411, "无权限");
		//const ok = await this.model.lessonOrganizationClassMembers.findOne({where:{organizationId: organizationId, memberId: params.memberId, roleId:{$ne: params.roleId}}});
		//if (ok)	return this.throw(400, "存在其它身份");

		if (roleId < CLASS_MEMBER_ROLE_ADMIN) {
			if (roleId <= CLASS_MEMBER_ROLE_STUDENT)	return this.throw(411, "无权限");
			const organ = await this.model.lessonOrganizations.findOne({where:{id: organizationId}}).then(o => o && o.toJSON());
			if (!organ) return this.throw(500);
			if (organ.privilege && 1 == 0) return this.throw(411, "无权限");
		} 
		
		const classIds = _.uniq(params.classIds || []);

		if (params.classId != undefined) {
			const member = await this.model.lessonOrganizationClassMembers.upsert(params);
			return this.success(member);
		} else {
			const oldmembers = await this.model.lessonOrganizationClassMembers.findAll({where:{organizationId, memberId: params.memberId}}).then(list => list.map(o => o.toJSON()));
			const datas = _.map(classIds, classId => ({...params, classId, roleId: params.roleId | (_.find(oldmembers, m => m.classId == classId) || {roleId:0}).roleId}));
			await this.model.lessonOrganizationClassMembers.destroy({where:{organizationId, memberId: params.memberId, roleId: params.roleId}});
			if (classIds.length == 0) {
				await this.model.query(`update lessonOrganizationClassMembers set roleId = roleId & ~${params.roleId} where organizationId = ${organizationId} and memberId = ${params.memberId}`, {type: this.model.QueryTypes.UPDATE});
			} else {
				await this.model.lessonOrganizationClassMembers.destroy({where:{organizationId, memberId: params.memberId, classId:{$in:classIds}}});
			}
			if (datas.length == 0) return this.success();
			const members = await this.model.lessonOrganizationClassMembers.bulkCreate(datas);
			return this.success(members);
		}
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
