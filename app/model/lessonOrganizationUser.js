/* eslint-disable no-magic-numbers */
'use strict';
/* 机构用户名关联表, 用于记录机构批量生成用户 */

module.exports = app => {
    const { BIGINT, INTEGER, STRING, JSON } = app.Sequelize;

    const model = app.model.define(
        'lessonOrganizationUsers',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            userId: {
                // 用户ID
                type: BIGINT,
                defaultValue: 0,
            },

            state: {
                // 关联状态 0 - 未关联  1 - 已关联
                type: INTEGER,
                defaultValue: 0,
            },

            organizationId: {
                // 机构ID
                type: BIGINT,
                defaultValue: 0,
            },

            classId: {
                type: BIGINT, // 班级ID
                defaultValue: 0,
            },

            handlerId: {
                // 操作人用户ID
                type: BIGINT,
                defaultValue: 0,
            },

            cellphone: {
                // 关联的手机号
                type: STRING(24),
                defaultValue: '',
                allowNull: false,
            },

            extra: {
                // 附加数据
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

    // model.sync({force:true});

    app.model.lessonOrganizationUsers = model;

    return model;
};
