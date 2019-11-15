/* eslint-disable no-magic-numbers */
'use strict';

module.exports = app => {
    const { BIGINT, STRING, INTEGER, DATE } = app.Sequelize;

    const model = app.lessonModel.define(
        'packages',
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

            packageName: {
                type: STRING,
                allowNull: false,
                unique: true,
            },

            subjectId: {
                type: BIGINT,
            },

            minAge: {
                type: INTEGER,
                defaultValue: 0,
            },

            maxAge: {
                type: INTEGER,
                defaultValue: 1000,
            },

            state: {
                //  0 - 初始状态  1 - 审核中  2 - 审核成功  3 - 审核失败  4 - 异常态(审核成功后被改坏可不用此状态 用0代替)
                type: INTEGER,
                defaultValue: 0,
            },

            intro: {
                type: STRING(512),
            },

            rmb: {
                // 人民币
                type: INTEGER,
                defaultValue: 0,
            },

            coin: {
                type: INTEGER,
                defaultValue: 0,
            },

            auditAt: {
                type: DATE,
            },

            lastClassroomCount: {
                type: INTEGER,
                defaultValue: 0,
            },

            coverUrl: {
                // 封面url
                type: STRING,
            },
            refuseMsg: {
                // 审核拒绝信息
                type: STRING,
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
        }
    );

    // model.sync({force:true});

    app.lessonModel.packages = model;

    return model;
};
