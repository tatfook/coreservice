const joi = require('joi');
const _ = require('lodash');
const base32 = require('hi-base32');

const Controller = require('../core/controller.js');
const {
  ENTITY_TYPE_USER,
  ENTITY_TYPE_SITE,
  ENTITY_TYPE_PAGE
} = require('../core/consts.js');

const World = class extends Controller {
	get modelName() {
		return 'worlds';
	}

	async save() {
		const {userId} = this.authenticated();
		const params = this.validate();
		const {id} = params;
		params.userId = userId;

		const world = await this.model.worlds.getById(id, userId);
		if (!world) return this.throw(400);

		await this.model.worlds.update(params, {where:{id, userId}});

		// 更新项目活跃度
		await this.model.contributions.addContributions(userId);

		// 更新对应项目更新时间
		const projectId = world.projectId;
		if (projectId) {
			await this.model.projects.update({id: projectId}, {where:{id:projectId}});
		}
		
		return this.success("OK");
	}

	async test() {
		const params = this.validate({
			worldName: 'string'
		});

		const ok = await this.ctx.service.world.generateDefaultWorld(params.worldName);
		console.log(params.worldName);
		return this.success(ok);
	}

	async testDelete() {
		const params = this.validate({
			worldName: 'string'
		});

		const ok = await this.ctx.service.world.removeProject(params.worldName);
		console.log(params.worldName);
		return this.success(ok);
	}
};

module.exports = World;
