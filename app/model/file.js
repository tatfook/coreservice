/* eslint-disable no-magic-numbers */
'use strict';
module.exports = app => {
    const { BIGINT, INTEGER, STRING } = app.Sequelize;

    const model = app.model.define(
        'files',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            key: {
                // 存储服务的文件名  推荐使用全路径  可以使用UUID 唯一即可
                type: STRING(256),
                unique: true,
            },

            userId: {
                // 文件所属者
                type: BIGINT,
            },

            siteId: {
                // 存在 归于站点  不存在归于 用户  用于多人编辑引用站点资源
                type: BIGINT,
            },

            filename: {
                // 文件名  方便用户识别文件
                type: STRING(128),
            },

            // 是否审核 1 -- 审核通过  2 -- 审核不通过  0 -- 未审核
            checked: {
                type: INTEGER,
                defaultValue: 0,
            },

            type: {
                // 文件类型
                type: STRING(12),
            },

            size: {
                type: BIGINT,
                defaultValue: 0,
            },

            hash: {
                // 七牛哈希  文件存于谁就用谁的hash   如 git sha
                type: STRING(64),
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
        }
    );

    app.model.files = model;
    return model;
};
