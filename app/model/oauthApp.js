'use strict';
module.exports = app => {
    const { BIGINT, STRING, TEXT, JSON } = app.Sequelize;

    const model = app.model.define(
        'oauthApps',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            userId: {
                // 文件所属者
                type: BIGINT,
                defaultValue: 0,
            },

            appName: {
                type: STRING,
                defaultValue: '',
                allowNull: false,
            },

            clientId: {
                type: STRING,
                unique: true,
                defaultValue: '',
            },

            clientSecret: {
                type: STRING,
                defaultValue: '',
            },

            description: {
                type: TEXT,
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
            indexes: [
                {
                    unique: true,
                    fields: [ 'userId', 'appName' ],
                },
            ],
        }
    );

    // model.sync({force:true}).then(() => {
    // console.log("create table successfully");
    // });

    app.model.oauthApps = model;

    return model;
};
