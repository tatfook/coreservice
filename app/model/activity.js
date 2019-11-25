'use strict';
module.exports = app => {
    const { BIGINT, STRING, TEXT, JSON } = app.Sequelize;
    // del
    const model = app.model.define(
        'activities',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            userId: {
                // 用户
                type: BIGINT,
                defaultValue: 0,
            },

            action: {
                // 行为
                type: STRING,
                defaultValue: '',
            },

            description: {
                // 描述
                type: TEXT,
                defaultValue: '',
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

    // model.sync({force:true}).then(() => {
    // console.log("create table successfully");
    // });

    app.model.activities = model;
    return model;
};
