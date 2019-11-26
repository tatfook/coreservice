'use strict';
module.exports = app => {
    const {
        BIGINT,

        JSON,
    } = app.Sequelize;
    // paracraft客户端，用户封装的代码块分类
    const model = app.model.define(
        'pBlockClassifies',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            blockId: {
                type: BIGINT,
                defaultValue: 0,
            },

            classifyId: {
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

            indexes: [
                {
                    unique: true,
                    fields: [ 'blockId', 'classifyId' ],
                },
            ],
        }
    );

    // model.sync({force:true}).then(() => {
    // console.log("create table successfully");
    // });

    app.model.pBlockClassifies = model;
    return model;
};
