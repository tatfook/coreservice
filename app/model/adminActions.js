/* eslint-disable no-magic-numbers */
'use strict';

module.exports = app => {
    const { BIGINT, STRING, JSON } = app.Sequelize;

    const model = app.model.define(
        'adminActions',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            userId: {
                // 操作者用户ID
                type: BIGINT,
                defaultValue: 0,
            },

            url: {
                // 请求的URL
                type: STRING(1024),
            },

            data: {
                // 请求的数据
                type: JSON,
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
        }
    );

    // model.sync({force:true});

    app.model.adminActions = model;
    return model;
};
