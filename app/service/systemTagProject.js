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
        let result;
        try {
            const promises = upsertArr.map(obj => {
                return this.model.systemTagProjects.upsert(obj, {
                    transaction,
                });
            });
            result = await Promise.all(promises);
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
        return result;
    }
    async updateProjectTag(projectId, tagId, sn) {
        return await this.model.systemTagProjects.update(
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
        let result;
        try {
            const promises = deleteArr.map(obj => {
                return this.model.systemTagProjects.destroy({
                    where: obj,
                    transaction,
                });
            });
            result = await Promise.all(promises);
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
        return result;
    }
}

module.exports = SystemTagProjectService;
