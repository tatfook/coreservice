/* eslint-disable no-magic-numbers */
'use strict';
module.exports = app => {
    const { BIGINT, STRING, JSON } = app.Sequelize;
    // paracraft客户端，用户封装的代码块
    const model = app.model.define(
        'pBlocks',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            userId: {
                // 用户ID
                type: BIGINT,
                defaultValue: 0,
            },

            name: {
                // 元件名称
                type: STRING,
                defaultValue: '',
            },

            previewUrl: {
                // 图片地址
                type: STRING(1024),
                defaultValue: '',
            },

            gifUrl: {
                // 动图地址
                type: STRING(1024),
                defaultValue: '',
            },

            fileUrl: {
                // 文件地址
                type: STRING(1024),
                defaultValue: '',
            },

            filetype: {
                // 文件类型
                type: STRING,
                defaultValue: '',
            },

            contributor: {
                // 贡献者
                type: STRING,
                defaultValue: '',
            },

            useCount: {
                // 使用次数
                type: BIGINT,
                defaultValue: 0,
            },

            extra: {
                type: JSON,
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
        }
    );

    app.model.pBlocks = model;

    model.associate = () => {
        app.model.pBlocks.hasMany(app.model.pBlockClassifies, {
            as: 'pBlockClassifies',
            foreignKey: 'blockId',
            sourceKey: 'id',
            constraints: false,
        });
    };
    return model;
};
