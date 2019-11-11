'use strict';
module.exports = app => {
    const { BIGINT, INTEGER } = app.Sequelize;

    const model = app.lessonModel.define(
        'packageLessons',
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

            packageId: {
                type: BIGINT,
                allowNull: false,
            },

            lessonId: {
                type: BIGINT,
                allowNull: false,
            },

            lessonNo: {
                // 课程包内的序号
                type: INTEGER,
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',

            indexes: [
                {
                    unique: true,
                    fields: [ 'packageId', 'lessonId' ],
                },
            ],
        }
    );

    app.lessonModel.packageLessons = model;

    return model;
};
