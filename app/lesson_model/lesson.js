'use strict';
module.exports = app => {
    const { BIGINT, STRING, JSON, TEXT } = app.Sequelize;

    const model = app.lessonModel.define(
        'lessons',
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

            lessonName: {
                type: STRING,
                allowNull: false,
            },

            subjectId: {
                type: BIGINT,
            },

            url: {
                type: STRING,
                unique: true,
                // allowNull: false,
            },

            coursewareUrl: {
                // 课程URL 允许为空
                type: STRING,
            },

            goals: {
                type: TEXT,
            },
            coverUrl: {
                // 封面url
                type: STRING,
            },
            duration: {
                // 时长，如：'90min'
                type: STRING,
            },
            teacherVideoUrl: {
                // 老师视频url
                type: STRING,
            },
            studentVideoUrl: {
                // 学生视频url
                type: STRING,
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
        }
    );

    app.lessonModel.lessons = model;

    return model;
};
