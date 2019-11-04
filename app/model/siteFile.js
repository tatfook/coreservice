'use strict';
module.exports = app => {
    const { BIGINT } = app.Sequelize;

    const model = app.model.define(
        'siteFiles',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            fileId: {
                // 文件ID
                type: BIGINT,
                allowNull: false,
            },

            userId: {
                // 文件使用位置的的用户名
                type: BIGINT,
                allowNull: false,
            },

            siteId: {
                // 文件使用位置的站点名
                type: BIGINT,
                allowNull: false,
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',

            indexes: [
                {
                    unique: true,
                    fields: [ 'fileId', 'userId', 'siteId' ],
                },
            ],
        }
    );

    app.model.siteFiles = model;
    return model;
};
