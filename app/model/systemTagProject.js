/* eslint-disable no-magic-numbers */
'use strict';
module.exports = app => {
    const { INTEGER, JSON } = app.Sequelize;

    const model = app.model.define(
        'systemTagProjects',
        {
            id: {
                type: INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            systemTagId: {
                type: INTEGER,
                allowNull: false,
                comment: 'systemtag的主键Id',
            },

            projectId: {
                type: INTEGER,
                allowNull: false,
                comment: 'project的主键Id',
            },
            sn: {
                type: INTEGER,
                allowNull: false,
                defaultValue: '0',
                comment: '项目在此标签下的顺序，顺序越大，显示越靠前',
            },
            extra: {
                type: JSON,
                allowNull: true,
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
            comment: 'systemTag和project的关联关系表',
            indexes: [
                {
                    unique: true,
                    fields: ['systemTagId', 'projectId'],
                },
            ],
        }
    );

    app.model.systemTagProjects = model;
    return model;
};
