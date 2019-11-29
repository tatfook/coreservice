/* eslint-disable no-magic-numbers */
'use strict';
module.exports = app => {
    const { BIGINT, INTEGER, STRING } = app.Sequelize;
    // TODO 课程包tag有用到，同移除lessonModel时一起优化
    const model = app.model.define(
        'tags',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            userId: {
                // 评论者
                type: BIGINT,
            },

            tagId: {
                type: STRING(24),
                allowNull: false,
            },

            objectType: {
                // 评论对象类型  0 -- 用户  1 -- 站点  2 -- 页面
                type: INTEGER,
                allowNull: false,
            },

            objectId: {
                // 评论对象id
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
                    fields: [ 'tagId', 'objectId', 'objectType' ],
                },
            ],
        }
    );

    app.model.tags = model;

    model.associate = () => {
        app.model.tags.belongsTo(app.model.systemTags, {
            as: 'systemTags',
            foreignKey: 'tagId',
            targetKey: 'id',
            constraints: false,
        });
    };

    return model;
};
