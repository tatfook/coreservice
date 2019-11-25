'use strict';
module.exports = app => {
    const { BIGINT, STRING, JSON } = app.Sequelize;
    // ???
    const model = app.model.define(
        'pClassifies',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            parentId: {
                type: BIGINT,
                defaultValue: 0,
            },

            name: {
                // 分类名
                type: STRING,
                defaultValue: '',
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

    // model.sync({force:true}).then(() => {
    // console.log("create table successfully");
    // });

    app.model.pClassifies = model;
    return model;
};
