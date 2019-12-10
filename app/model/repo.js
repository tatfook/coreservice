'use strict';
/* eslint-disable no-magic-numbers */
module.exports = app => {
    const { BIGINT, BOOLEAN, DATE, STRING } = app.Sequelize;

    const model = app.model.define(
        'repos',
        {
            id: {
                type: BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            resourceId: {
                type: BIGINT,
                allowNull: false,
                comments: 'repo的宿主id，绑定对应的site或者world',
            },
            resourceType: {
                type: STRING(16),
                allowNull: false,
                comments: 'repo类型，目前指的是site和world',
            },
            username: {
                type: STRING(48),
                allowNull: false,
            },
            repoName: {
                type: STRING(128),
                allowNull: false,
            },
            path: {
                type: STRING(180), // 旧数据中有些项目名字又臭又长
                allowNull: false,
            },
            synced: {
                type: BOOLEAN,
                defaultValue: false,
            },
            createdAt: {
                type: DATE,
            },
            updatedAt: {
                type: DATE,
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
        }
    );

    model.prototype.isSite = function() {
        return this.resourceType === 'Site';
    };

    model.prototype.isWorld = function() {
        return this.resourceType === 'World';
    };

    app.model.repos = model;
    return model;
};
