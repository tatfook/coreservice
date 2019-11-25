'use strict';
module.exports = app => {
    const { BIGINT, STRING, TEXT, JSON, DATE } = app.Sequelize;
    // del???
    const model = app.model.define(
        'paracraftNews',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            title: {
                // 标题
                type: STRING,
                defaultValue: '',
            },

            description: {
                // 描述
                type: TEXT,
            },

            date: {
                // 发布日期
                type: DATE,
            },

            url: {
                // 地址
                type: STRING,
            },

            extra: {
                type: JSON,
                defaultValue: {},
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
        }
    );

    // model.sync({force:true});

    app.model.paracraftNews = model;

    return model;
};
