/* eslint-disable no-magic-numbers */
'use strict';
module.exports = app => {
    const { BIGINT, STRING, JSON } = app.Sequelize;

    const model = app.model.define(
        'worlds',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            userId: {
                // 用户id
                type: BIGINT,
                allowNull: false,
            },

            worldName: {
                // 世界名
                type: STRING(128),
                allowNull: false,
            },

            revision: {
                // 版本
                type: STRING(32),
                allowNull: false,
                defaultValue: 0,
            },

            projectId: {
                // 项目id
                type: BIGINT,
                allowNull: false,
            },

            commitId: {
                // 最后一次提价id
                type: STRING(64),
                defaultValue: 'master',
            },

            archiveUrl: {
                // git archive url
                type: STRING(255),
                defaultValue: '',
            },

            fileSize: {
                // 文件大小
                type: BIGINT,
                defaultValue: 0,
            },

            giturl: {
                // git url
                type: STRING(256),
            },

            download: {
                // 下载地址
                type: STRING(256),
            },

            extra: {
                type: JSON,
                defaultValue: {},
            },

            // 默认字段 updatedAt修改日期  createdAt创建日期
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
            indexes: [
                {
                    unique: true,
                    fields: [ 'userId', 'worldName' ],
                },
                {
                    unique: true,
                    fields: [ 'projectId' ],
                },
            ],
        }
    );
    async function __hook__(inst, options) {
        const { userId } = inst;
        const transaction = options.transaction;
        const count = await app.model.worlds.count({
            where: { userId },
            transaction,
        });
        await app.model.userRanks.update(
            { world: count },
            { where: { userId }, transaction }
        );
    }
    model.afterCreate(__hook__);

    model.afterDestroy(__hook__);

    model.getById = async function(id, userId) {
        const where = { id };

        if (userId) where.userId = userId;

        const data = await app.model.worlds.findOne({ where });

        return data && data.get({ plain: true });
    };

    model.getByProjectId = async function(projectId) {
        const world = await app.model.worlds.findOne({ where: { projectId } });

        return world && world.get({ plain: true });
    };

    model.prototype.canReadByUser = async function(userId) {
        // TODO: currently, there's no permission logic for 'world' project
        if (userId) return true;
    };

    model.prototype.canWriteByUser = async function(userId) {
        // TODO: currently, there's no permission logic for 'world' project
        return this.userId === userId;
    };

    app.model.worlds = model;
    return model;
};
