const _ = require("lodash");
const moment = require("moment");
const {
	CLASS_MEMBER_ROLE_STUDENT,
	CLASS_MEMBER_ROLE_TEACHER,
	CLASS_MEMBER_ROLE_ADMIN,
} = require("../core/consts.js");

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
		DATE,
	} = app.Sequelize;

	const model = app.model.define("lessonOrganizationLogs", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		organizationId: {
			type: BIGINT,
			defaultValue: 0,
		},

		type: {
			type: STRING,
			defaultValue:"",
		},

		description: {
			type: TEXT,
		},

		handleId: {
			type: BIGINT,
			defaultValue:0,
		},

		username: {
			type: STRING,
			defaultValue:"",
		},

		extra: {
			type: JSON,
			defaultValue: {},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});
	
	app.model.lessonOrganizationLogs = model;

	model.changeStudentPwd = async function({memberId, username, handleId}) {
		const user = await app.model.users.findOne({where: {id: memberId}});
		if (!user) return;

		const log = {
			type: "学生",
			description:"修改密码, 学生: " + user.username,
			username, 
			handleId,
		}
		
		await app.model.lessonOrganizationLogs.create(log);
	}

	model.studentLog = async function({oldmembers, roleId,  classIds, realname = "", memberId}) {
		if (classIds.length == 0) {
			if (roleId == CLASS_MEMBER_ROLE_STUDENT) {
				return await app.model.lessonOrganizationLogs.create({type: "学生", description:"删除, 学生: " + oldmembers[0].realname, username, handleId});
			} 
			if (roleId == CLASS_MEMBER_ROLE_TEACHER) {
				return await app.model.lessonOrganizationLogs.create({type: "老师", description:"删除, 老师: " + oldmembers[0].realname, username, handleId});
			} 
		}

		if (classIds.length == 1 && classIds[0] == 0) {
			if (roleId == CLASS_MEMBER_ROLE_STUDENT) {
				return await app.model.lessonOrganizationLogs.create({type: "学生", description:"添加学生: " + realname, username, handleId});
			} 
			if (roleId == CLASS_MEMBER_ROLE_TEACHER) {
				return await app.model.lessonOrganizationLogs.create({type: "老师", description:"添加老师: " + realname, username, handleId});
			} 
		}

		for(let i = 0; i < oldmembers.length; i++) {
			const member = oldmembers[i];
			const index = classIds.indexOf(member.classId);
			const cls = await app.model.lessonOrganizationClasses.findOne({where:{id: member.classId}});
			if (index < 0) {
				if (roleId == CLASS_MEMBER_ROLE_STUDENT) {
					await app.model.lessonOrganizationLogs.create({type: "班级", description:`移除学生, ${cls.name}, 移除学生: ${member.realname}`, handleId, username});
				}
				if (roleId == CLASS_MEMBER_ROLE_TEACHER) {
					await app.model.lessonOrganizationLogs.create({type: "班级", description:`移除老师, ${cls.name}, 移除老师: ${member.realname}`, handleId, username});
				}
				continue;
			} else {
				if (member.realname != realname && realname) {
					if (roleId == CLASS_MEMBER_ROLE_STUDENT) {
						await app.model.lessonOrganizationLogs.create({type: "学生", description:`改名, 学生: ${member.realname}, 修改为: ${realname}`, handleId, username});
					}
					if (roleId == CLASS_MEMBER_ROLE_TEACHER) {
						await app.model.lessonOrganizationLogs.create({type: "老师", description:`改名, 教师: ${member.realname}, 修改为: ${realname}`, handleId, username});
					}
					realname = member.realname;
					continue;
				}
			}
		}

		for (let i = 0; i < classIds.length; i++) {
			const classId = classIds[i];
			const member = _.find(oldmembers, o => o.classIds == classId && o.roleId & roleId);
			if (member) continue;
			if (roleId == CLASS_MEMBER_ROLE_STUDENT) {
				await app.model.lessonOrganizationLogs.create({type: "班级", description:`添加学生, ${cls.name}, 添加学生: ${realname}`, handleId, username});
			}
			if (roleId == CLASS_MEMBER_ROLE_TEACHER) {
				await app.model.lessonOrganizationLogs.create({type: "班级", description:`添加老师, ${cls.name}, 添加老师: ${realname}`, handleId, username});
			}
		}
	}

	return model;
};

