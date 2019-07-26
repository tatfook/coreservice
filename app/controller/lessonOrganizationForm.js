
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const LessonOrganizationForm = class extends Controller {
	get modelName() {
		return "lessonOrganizationForms";
	}

	async search() {
		const {organizationId} = this.validate({organizationId:"number"});
		
		const list = await this.model.lessonOrganizationForms.findAll({organizationId}).then(list => list.map(o => o.toJSON()));

		return this.success(list);
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

		const submit = await this.model.lessonOrganizationFormSubmits(params);

		return this.success(submit);
	}

	async getSubmit() {
		const {userId, organizationId} = this.authenticated();
		const {id} = this.validate({id: "number"});

		const result = await this.model.lessonOrganizationFormSubmits.findAndCount({...this.queryOptions, where:{formId:id, organizationId}}).then(list => list.map(o => o.toJSON()));

		return this.success(result);
	}

	async updateSubmit() {
		const {userId, organizationId} = this.getUser();
		const {id, submitId, comment, state, quizzes} = this.validate({id:"number", submitId: "number"});

		const ok = await this.model.lessonOrganizationFormSubmits.update({comment, state, quizzes}, {where:{id:submitId, formId:id}});

		return this.success(ok);
	}
}

module.exports = LessonOrganizationForm;
