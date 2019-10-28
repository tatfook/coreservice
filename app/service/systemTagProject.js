/* eslint-disable no-magic-numbers */
'use strict';
// const Service = require('egg').Service;
const Service = require('../core/service.js');

class SystemTagProjectService extends Service {
    async createProjectTags(projectId, tags) {
        const upsertArr = tags.map(tag => {
            return {
                projectId,
                systemTagId: tag.tagId,
                sn: tag.sn,
            };
        });
        const transaction = await this.ctx.model.transaction();
        try {
            const promises = upsertArr.map(obj => {
                return this.model.systemTagProjects.upsert(obj, {
                    transaction,
                });
            });
            await Promise.all(promises);
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
    async updateProjectTag(projectId, tagId, sn) {
        await this.model.systemTagProjects.update(
            {
                sn,
            },
            {
                where: {
                    projectId,
                    systemTagId: tagId,
                },
            }
        );
    }
    async deleteProjectTags(projectId, tagIds) {
        const deleteArr = tagIds.map(id => {
            return {
                projectId,
                systemTagId: id,
            };
        });
        const transaction = await this.ctx.model.transaction();
        try {
            const promises = deleteArr.map(obj => {
                return this.model.systemTagProjects.destroy({
                    where: obj,
                    transaction,
                });
            });
            await Promise.all(promises);
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
}

module.exports = SystemTagProjectService;
