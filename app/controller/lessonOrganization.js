
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const {
	CLASS_MEMBER_ROLE_STUDENT,
	CLASS_MEMBER_ROLE_TEACHER,
	CLASS_MEMBER_ROLE_ADMIN,
} = require("../core/consts.js");

const LessonOrganization = class extends Controller {
	get modelName() {
		return "lessonOrganizations";
	}

	async login() {
		let {username, password, organizationId, organizationName} = this.validate({username:"string", password:"string"});
		const user = await this.model.users.findOne({where: {[this.model.Op.or]: [{username: username}, {cellphone:username}, {email: username}], password: this.app.util.md5(password)}}).then(o => o && o.toJSON());
		if (!user) return this.fail(1);
	
		if (!organizationId) {
			if (!organizationName) return this.throw(400);
			const organ = await this.model.lessonOrganizations.findOne({where:{name: organizationName}}).then(o => o && o.toJSON());
			if (!organ) return this.throw(400);
			organizationId = organ.id;
		}

		const member = await this.model.lessonOrganizationClassMembers.findOne({where: {organizationId, memberId: user.id}}).then(o => o && o.toJSON());
		if (!member) return this.throw(400, "成员不存在");

		const config = this.app.config.self;
		const tokenExpire = config.tokenExpire || 3600 * 24 * 2;
		const token = this.app.util.jwt_encode({
			userId: user.id, 
			roleId: member.roleId,
			username: user.username,
			organizationId: organizationId,
		}, config.secret, tokenExpire);

		user.token = token;
		user.roleId = member.roleId;
		user.organizationId = organizationId;
		delete user.password;

		return this.success(user);
	}

	async show() {
		const {id} = this.validate({id: "number"});

		const organ = await this.model.lessonOrganizations.findOne({where: {id}});
		if (!organ) return this.throw(404);

		return this.success(organ);
	}

	async getByUrl() {
		const {url} = this.validate({url:"string"});

		const organ = await this.model.lessonOrganizations.findOne({where:{loginUrl: url}});
		if (!organ) return this.throw(404);

		return this.success(organ);
	}

	async getByName() {
		const {name} = this.validate({name:"string"});

		const organ = await this.model.lessonOrganizations.findOne({where:{name}});
		if (!organ) return this.throw(404);

		return this.success(organ);
	}

	async create() {
		this.adminAuthenticated();

		const params = this.validate();

		const organ = await this.model.lessonOrganizations.create(params).then(o => o && o.toJSON());
		if (!organ) return this.throw(500);

		if (params.packages) {
			const packages = _.map(params.packages, pkg => ({
				organizationId: organ.id,
				classId: 0,
				packageId: pkg.packageId,
				lessons: pkg.lessons,
			}));
			await this.model.lessonOrganizationPackages.bulkCreate(packages);
		}

		if (params.usernames) {
			const users = await this.model.users.findAll({where:{username:{[this.model.Op.in]: params.usernames}}}).then(list => _.map(list, o => o.toJSON()));
			const members = _.map(users, o => ({
				classId: 0,
				organizationId: organ.id,
				memberId: o.id,
				roleId: CLASS_MEMBER_ROLE_ADMIN,
			}));
			await this.model.lessonOrganizationClassMembers.bulkCreate(members);
		}


		return this.success(organ);
	}
	
	async fixedClassPackage(organizationId, packages) {
		const pkgs = await this.model.lessonOrganizationPackages.findAll({where:{organizationId, classId:{$gt:0}}}).then(list => list.map(o => o.toJSON()));
		const datas = [];
		_.each(pkgs, o => {
			const pkg = _.find(packages, p => p.packageId == o.packageId);
			if (!pkg) return;
			const lessons = [];
			_.each(o.lessons, l => {
				if (_.find(pkg.lessons, pl => pl.lessonId == l.lessonId)) lessons.push(l);
			});
			o.lessons = lessons;
			datas.push(o);
		});
		await this.model.lessonOrganizationPackages.destroy({where:{organizationId, classId:{$gt:0}}});
		await this.model.lessonOrganizationPackages.bulkCreate(datas);
	}

	// 禁止更新
	async update() {
		const params = this.validate({id:'number'});
		const id = params.id;

		delete params.userId;
		if (this.ctx.state.admin && this.ctx.state.admin.userId) {
			await this.model.lessonOrganizations.update(params, {where:{id}});
		} else {
			const {userId, roleId = 0} = this.authenticated();
			if (roleId < CLASS_MEMBER_ROLE_ADMIN) return this.throw(411, "无效token");
			await this.model.lessonOrganizations.update(params, {where:{id}});
		} 

		if (params.packages) {
			await this.model.lessonOrganizationPackages.destroy({where:{organizationId: id, classId:0}});
			const datas = _.map(params.packages, pkg => ({
				organizationId: id,
				classId: 0,
				packageId: pkg.packageId,
				lessons: pkg.lessons,
			}));
			await this.model.lessonOrganizationPackages.bulkCreate(datas);
			await this.fixedClassPackage(id, params.packages);
		}

		if (params.usernames) {
			await this.model.lessonOrganizationClassMembers.destroy({where:{classId:0, organizationId: id}});
			const users = await this.model.users.findAll({where:{username:{[this.model.Op.in]: params.usernames}}}).then(list => _.map(list, o => o.toJSON()));
			const members = _.map(users, o => ({
				classId: 0,
				organizationId: id,
				memberId: o.id,
				roleId: CLASS_MEMBER_ROLE_ADMIN,
			}));
			await this.model.lessonOrganizationClassMembers.bulkCreate(members);
		}

		return this.success();
	}

	mergePackages(list = []) {
		const pkgmap = {};
		// 合并课程
		_.each(list, o => {
			if (pkgmap[o.packageId]) {
				pkgmap[o.packageId].lessons = (pkgmap[o.packageId].lessons || []).concat(o.lessons || []);
				pkgmap[o.packageId].lessons = _.uniqBy(pkgmap[o.packageId].lessons, "lessonId");
			} else {
				pkgmap[o.packageId] = o;
			}
		});

		list = [];
		_.each(pkgmap, o => list.push(o));

		return list;
	}

	// 课程包
	async packages() {
		const {userId, roleId, organizationId} = this.authenticated();
		const {classId=0} = this.validate({classId: "number_optional"});

		let list = [];
		if (classId) {
			list = await this.model.lessonOrganizationPackages.findAll({
				where: {
					organizationId,
					classId,
				},
			}).then(list => _.map(list, o => o.toJSON()));
		} else {
			list = await this.model.lessonOrganizationPackages.findAll({
				include: [
				{
					as: "lessonOrganizationClassMembers",
					model: this.model.lessonOrganizationClassMembers,
					where: {memberId: userId},
				}
				],
				where: {
					organizationId,
				}
			}).then(list => _.map(list, o => o.toJSON()));
		}

		list = this.mergePackages(list);

		for(let i = 0; i < list.length; i++) {
			const pkg = list[i];
			const ids = _.map(pkg.lessons, o => o.lessonId);
			const lrs = await this.app.lessonModel.userLearnRecords.findAll({
				where: {
					userId,
					packageId: pkg.packageId,
					lessonId: {$in:ids},
				}
			});
			_.each(pkg.lessons, o => {
				o.isLearned = _.find(lrs, lr => lr.lessonId == o.lessonId) ? true : false;
			});
		}

		const pkgIds = _.map(list, o => o.packageId);
		const pkgs = await this.app.lessonModel.packages.findAll({where: {id: {[this.model.Op.in]:pkgIds}}}).then(list => _.map(list, o => o.toJSON()));
		if (classId) {
			const classrooms = await this.app.lessonModel.classrooms.findAll({where:{classId, packageId:{$in: pkgIds}}}).then(list => list.map(o => o.toJSON()));
			_.each(list, o => {
				const cls = classrooms.map(c => c.packageId == o.packageId);
				const c = _.orderBy(cls, ['createdAt', 'desc'])[0]; 
				if (c) o.lastTeachTime = c.createdAt;
			});
		}
		_.each(list, o => o.package = _.find(pkgs, p => p.id == o.packageId));

		return this.success(list);
	}

	async getPackage(packageId, classId) {
		const {userId, organizationId, roleId} = this.authenticated();
		let list = [];
		if (classId) {
			list = await this.model.lessonOrganizationPackages.findAll({where: {organizationId, packageId, classId}}).then(list => _.map(list, o => o.toJSON()));
		} else {
			list = await this.model.lessonOrganizationPackages.findAll({
				include: [
				{
					as: "lessonOrganizationClassMembers",
					model: this.model.lessonOrganizationClassMembers,
					where: {memberId: userId},
				},
				],
				where: {
					organizationId,
					packageId,
				}
			}).then(list, _.map(list, o => o.toJSON()));
		}

		list = this.mergePackages(list);

		return list[0];
	}

	// 课程包详情页
	async packageDetail() {
		const {userId, organizationId, roleId} = this.authenticated();
		const {packageId, classId = 0} = this.validate({packageId: "number", "classId":"number_optional"});

		const pkg = await this.getPackage(packageId, classId);
		if (!pkg) return this.throw(400);

		const pkginfo = await this.app.lessonModel.packages.findOne({where:{id: pkg.packageId}}).then(o => o && o.toJSON());
		const lessonIds = _.map(pkg.lessons, o => o.lessonId);
		const lessons = await this.app.lessonModel.lessons.findAll({where:{id:{[this.model.Op.in]: lessonIds}}}).then(list => _.map(list, o => o.toJSON()));
		_.each(pkg.lessons, o => o.lesson = _.find(lessons, l => l.id == o.lessonId));
		// 授课记录
		const classrooms = await this.app.lessonModel.classrooms.findAll({
			attributes: ["packageId", "lessonId", "classId"],
			where: {
				userId,
				classId,
				packageId,
				lessonId:{
					[this.model.Op.in]: lessonIds,
				},
			}
		});
		const learnRecords = await this.app.lessonModel.learnRecords.findAll({
			attributes: ["packageId", "lessonId", "classId"],
			where: {
				userId,
				packageId,
				state: 1,
				lessonId:{
					[this.model.Op.in]: lessonIds,
				},
			}
		});

		pkg.package = pkginfo;

		_.each(pkg.lessons, o => {
			o.isTeached = _.find(classrooms, c => c.lessonId == o.lessonId) ? true : false;
			o.isLearned = _.find(learnRecords, l => l.lessonId == o.lessonId) ? true : false;
		});
		
		return this.success(pkg);
	}
}

module.exports = LessonOrganization;
