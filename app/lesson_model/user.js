/* eslint-disable no-magic-numbers */
'use strict';
module.exports = app => {
    const { BIGINT, STRING, INTEGER, JSON } = app.Sequelize;

    const model = app.lessonModel.define(
        'users',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            username: {
                // keepwork username
                type: STRING(64),
                unique: true,
                allowNull: false,
            },

            nickname: {
                // lesson昵称或真是姓名
                type: STRING(64),
            },

            coin: {
                // 知识币
                type: INTEGER,
                defaultValue: 0,
            },

            lockCoin: {
                // 待解锁的知识币
                type: INTEGER,
                defaultValue: 0,
            },

            bean: {
                type: INTEGER,
                defaultValue: 0,
            },

            identify: {
                // 身份
                type: INTEGER, // 0 = 默认 1 - 学生  2 - 教师 4 - 申请老师
                defaultValue: 0,
            },

            extra: {
                // 额外数据
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

    app.lessonModel.users = model;
    return model;
};
