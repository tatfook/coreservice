
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");
const {
	CLASS_MEMBER_ROLE_STUDENT,
	CLASS_MEMBER_ROLE_TEACHER,
	CLASS_MEMBER_ROLE_ADMIN,
} = require("../core/consts.js");

const LessonOrganizationForm = class extends Controller {
	get modelName() {
		return "lessonOrganizationForms";
	}

	async search() {
		const query = this.validate({organizationId:"number"});
		
		const list = await this.model.lessonOrganizationForms.findAll({
			include: [
			{
				as: "lessonOrganizationFormSubmits",
				model: this.model.lessonOrganizationFormSubmits,
				//attributes: {exclude:["userId", "organizationId", "quizzes", "state", "comment", "extra", "createdAt", "updatedAt"]},
				attributes: ["formId"],
				limit: 100000,
			}
			],
			where: query,
		}).then(list => list.map(o => o.toJSON()));

		_.each(list, o => {
			o.submitCount = o.lessonOrganizationFormSubmits.length;
			o.lessonOrganizationFormSubmits = undefined;
		});

		return this.success(list);
	}

	async create() {
		let {organizationId, userId, roleId} = this.authenticated();
		const params = this.validate();
		if (!organizationId && !params.organizationId) return this.throw(400);
		if (params.organizationId && params.organizationId != organizationId) {
			organizationId = params.organizationId;
			roleId = await this.ctx.service.organization.getRoleId(organizationId, userId);
		}

		if (roleId < CLASS_MEMBER_ROLE_ADMIN) return this.throw(400);

		params.organizationId = organizationId;
		params.userId = userId;

		const data = await this.model.lessonOrganizationForms.create(params);

		return this.success(data);
	}

	async update() {
		let {organizationId, userId, roleId} = this.authenticated();
		const params = this.validate({id:"number"});
		if (!organizationId && !params.organizationId) return this.throw(400);
		if (params.organizationId && params.organizationId != organizationId) {
			organizationId = params.organizationId;
			roleId = await this.ctx.service.organization.getRoleId(organizationId, userId);
		}

		if (roleId < CLASS_MEMBER_ROLE_ADMIN) return this.throw(400);
		delete params.organizationId;
		delete params.userId;

		const data = await this.model.lessonOrganizationForms.update(params, {where:{id:params.id}});

		return this.success(data);
	}

	async postSubmit() {
		//const {userId} = this.authenticated();
		const params = this.validate({id: "number"});
		const formId = params.id;
		delete params.id;

		const form = await this.model.lessonOrganizationForms.findOne({where:{id: formId}}).then(o => o && o.toJSON());
		if (!form) return this.throw(400);

		params.organizationId = form.organizationId;
		params.userId = this.getUser().userId || 0;
		params.formId = formId;

		const submit = await this.model.lessonOrganizationFormSubmits.create(params);

		return this.success(submit);
	}

	async getSubmit() {
		let {userId, organizationId, roleId} = this.authenticated();
		const params = this.validate({id: "number"});
		if (!organizationId && !params.organizationId) return this.throw(400);
		if (params.organizationId && params.organizationId != organizationId) {
			organizationId = params.organizationId;
			roleId = await this.ctx.service.organization.getRoleId(organizationId, userId);
		}
		if (roleId < CLASS_MEMBER_ROLE_ADMIN) return this.throw(400);
		

		const {id} = params;
		const result = await this.model.lessonOrganizationFormSubmits.findAndCountAll({...this.queryOptions, where:{formId:id}});

		return this.success(result);
	}

	async updateSubmit() {
		let {userId, organizationId, roleId} = this.authenticated();
		const params = this.validate({id:"number", submitId: "number"});

		if (!organizationId && !params.organizationId) return this.throw(400);
		if (params.organizationId && params.organizationId != organizationId) {
			organizationId = params.organizationId;
			roleId = await this.ctx.service.organization.getRoleId(organizationId, userId);
		}
		if (roleId < CLASS_MEMBER_ROLE_ADMIN) return this.throw(400);

		const {id, submitId, comment, state, quizzes} = params;

		const ok = await this.model.lessonOrganizationFormSubmits.update({comment, state, quizzes}, {where:{id:submitId, formId:id}});

		return this.success(ok);
	}
}

module.exports = LessonOrganizationForm;