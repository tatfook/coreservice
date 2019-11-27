'use strict';

const base32 = require('hi-base32');
const Service = require('egg').Service;

class World extends Service {
    // 创建3D 实现3D世界相关的文件的创建
    // project 对象项目记录对象
    async createWorldByProject(project, transaction) {
        const { ctx, service } = this;
        const worldName = project.name; // 世界名
        const projectId = project.id; // 项目ID
        const userId = project.userId; // 用户ID
        const world = await ctx.model.World.create(
            { worldName, projectId, userId },
            { transaction }
        );
        const repo = await service.repo.generateFromWorld(world, transaction);
        await service.repo.syncRepo(repo, transaction);
        return world;
    }

    async destroyWorldByProject(project, transaction) {
        const { ctx, service } = this;
        const projectId = project.id; // 项目ID
        const world = await ctx.model.World.findOne({
            where: { projectId },
            transaction,
        });
        await service.repo.destroyRepo('World', world.id, transaction);
        await world.destroy({ transaction });
    }

    base32(text) {
        if (text) {
            const notLetter = text.match(/[^a-zA-Z]/g);
            if (notLetter) {
                text = base32.encode(text);

                text = text.replace(/[=]/g, '');
                text = text.toLocaleLowerCase();

                text = 'world_base32_' + text;
            } else {
                text = 'world_' + text;
            }
            return text;
        }
        return null;
    }

    unbase32(text) {
        if (text) {
            const notLetter = text.match('world_base32_');
            if (notLetter) {
                text = text.replace('world_base32_', '');
                return base32.decode(text);
            }
            text = text.replace('world_', '');
            return text;
        }
        return null;
    }
}

module.exports = World;
