'use strict';

module.exports = app => {
    const { BIGINT, INTEGER, JSON } = app.Sequelize;
    // del
    const model = app.model.define(
        'events',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            eventId: {
                type: INTEGER,
                defaultValue: 0,
            },

            value: {
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
                    fields: [ 'eventId' ],
                },
            ],
        }
    );

    // model.sync({force:true});

    app.model.events = model;
    return model;
};
