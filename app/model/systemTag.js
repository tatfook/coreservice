/* eslint-disable no-magic-numbers */
'use strict';
module.exports = app => {
    const { BIGINT, INTEGER, STRING, JSON } = app.Sequelize;

    const model = app.model.define(
        'systemTags',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            classify: {
                type: INTEGER,
                defaulValue: 0,
            },

            tagname: {
                type: STRING(24),
                allowNull: false,
            },

            extra: {
                type: JSON,
                defaulValue: {},
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
            indexes: [
                {
                    unique: true,
                    fields: ['classify', 'tagname'],
                },
            ],
        }
    );

    app.model.systemTags = model;

    model.associate = () => {
        app.model.systemTags.belongsToMany(app.model.projects, {
            through: {
                model: app.model.systemTagProjects,
            },
            foreignKey: 'systemTagId',
            constraints: false,
        });

        app.model.systemTags.hasMany(app.model.tags, {
            as: 'tags',
            foreignKey: 'tagId',
            sourceKey: 'id',
            constraints: false,
        });
    };
    return model;
};
