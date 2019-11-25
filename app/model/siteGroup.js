'use strict';
module.exports = app => {
    const { BIGINT, INTEGER } = app.Sequelize;
    //
    const model = app.model.define(
        'siteGroups',
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

            siteId: {
                type: BIGINT,
                allowNull: false,
            },

            groupId: {
                type: BIGINT,
                allowNull: false,
            },

            level: {
                type: INTEGER,
                defaultValue: 0,
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
            indexes: [
                {
                    unique: true,
                    fields: [ 'siteId', 'groupId' ],
                },
            ],
        }
    );

    model.getById = async function(id, userId) {
        const where = { id };

        if (userId) where.userId = userId;

        const data = await app.model.siteGroups.findOne({ where });

        return data && data.get({ plain: true });
    };

    model.getByUserId = async function(userId) {
        const sql =
            // eslint-disable-next-line max-len
            'select siteGroups.id, siteGroups.siteId, siteGroups.groupId, siteGroups.level, groups.groupname from siteGroups, groups where siteGroups.groupId = groups.id and siteGroups.userId = :userId';

        const list = await app.model.query(sql, {
            replacements: {
                userId,
            },
        });

        return list;
    };

    app.model.siteGroups = model;
    return model;
};
