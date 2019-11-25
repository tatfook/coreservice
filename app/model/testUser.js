'use strict';
module.exports = app => {
    const { BIGINT } = app.Sequelize;
    // del
    const model = app.model.define(
        'testUsers',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
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

    // model.beforeBulkDestroy((where) => {
    // console.log("------- user");
    // });

    app.model.testUsers = model;
    return model;
};
