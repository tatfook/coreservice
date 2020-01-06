'use strict';

const Controller = require('../core/controller.js');

const World = class extends Controller {
    get modelName() {
        return 'worlds';
    }

    async save() {
        const { userId } = this.authenticated();
        const params = this.validate();
        const { id } = params;
        params.userId = userId;

        const world = await this.model.worlds.getById(id, userId);
        if (!world) return this.throw(400);

        await this.model.worlds.update(params, { where: { id, userId } });

        // 更新项目活跃度
        await this.model.contributions.addContributions(userId);

        // 更新对应项目更新时间
        const projectId = world.projectId;
        if (projectId) {
            const transaction = await this.model.transaction();
            try {
                await this.model.projects.update(
                    { id: projectId },
                    {
                        where: { id: projectId },
                        transaction,
                        individualHooks: true,
                    }
                );
                await transaction.commit();
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        }

        return this.success('OK');
    }
};

module.exports = World;
