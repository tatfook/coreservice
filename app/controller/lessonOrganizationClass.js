
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

const LessonOrganizationClass = class extends Controller {
	get modelName() {
		return "lessonOrganizationClasses";
	}

	async show() {
		const {id} = this.validate({id: "number"});

		const organ = await this.model.lessonOrganizations.findOne({where: {id}});

		return this.success(organ);
	}

	async index() {
		const {userId, organizationId} = this.authenticated();
		const list = await this.model.findAll({where:{organizationId, memberId: userId}});

		return this.success(list);
	}

	async create() {
		const {roleId, organizationId} = this.authenticated();
		const params = this.validate({name:"string"});
		if (roleId & CLASS_MEMBER_ROLE_ADMIN == 0) return this.throw(411, "无权限");

		params.organizationId = organizationId;
		const packages = params.packages || [];

		const cls = await this.model.lessonOrganizationsClasses.create(params).then(o => o && o.toJSON());
		if (!cls) return this.throw(500);

		const datas = [];
		_.each(packages, pkg => {
			datas.push({
				objectId: cls.id,
				objectType: ENTITY_TYPE_ORGANIZATION_CLASS,
				packageId: pkg.packageId,
				lessons: pkg.lessons,
			});
		})
		
		await this.model.lessonOrganizationPackages.bulkCreate(datas);

		return this.success(cls);
	}
	
	// 禁止更新
	async update() {
	}
}

module.exports = LessonOrganizationClass;
