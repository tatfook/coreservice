'use strict';
module.exports = app => {
    const { BIGINT } = app.Sequelize;

    const model = app.model.define(
        'testProjects',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            userId: {
                type: BIGINT,
                allowNull: false,
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

    // model.beforeBulkDestroy((where, ) => {
    // console.log("-------");
    // });

    app.model.testProjects = model;

    return model;
};
