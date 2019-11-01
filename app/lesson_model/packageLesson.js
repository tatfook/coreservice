'use strict';
module.exports = app => {
    const { BIGINT, JSON } = app.Sequelize;

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
                    fields: [ 'packageId', 'lessonId' ],
                },
            ],
        }
    );

    app.lessonModel.packageLessons = model;

    return model;
};
