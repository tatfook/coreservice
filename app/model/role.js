'use strict';
const _ = require('lodash');
const {
    USER_ROLE_ALLIANCE_MEMBER,
    USER_ROLE_TUTOR,
} = require('../core/consts.js');

module.exports = app => {
    const { BIGINT, INTEGER, JSON } = app.Sequelize;

    const model = app.model.define(
        'roles',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            userId: {
                // 用户ID
                type: BIGINT,
                allowNull: false,
            },

            roleId: {
                type: INTEGER,
                allowNull: false,
                defaultValue: 0,
            },

            startTime: {
                // 开始时间
                type: BIGINT,
                defaultValue: 0,
            },

            endTime: {
                // 结束时间
                type: BIGINT,
                defaultValue: 0,
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
                    fields: [ 'userId', 'roleId' ],
                },
            ],
        }
    );

    model.getByUserId = async function(userId) {
        return await app.keepworkModel.roles
            .findAll({ where: { userId } })
            .then(list => _.map(list, o => o && o.toJSON()));
    };

    model.getRoleIdByUserId = async function(userId) {
        const roles = await this.getByUserId(userId);
        let roleId = 0;
        _.each(roles, role => (roleId = roleId | role.roleId));

        return roleId;
    };

    model.getAllianceMemberByUserId = async function(userId) {
        return await app.keepworkModel.roles
            .findOne({
                where: {
                    userId,
                    roleId: USER_ROLE_ALLIANCE_MEMBER,
                },
            })
            .then(o => o && o.toJSON());
    };

    model.getTutorByUserId = async function(userId) {
        return await app.keepworkModel.roles
            .findOne({
                where: {
                    userId,
                    roleId: USER_ROLE_TUTOR,
                },
            })
            .then(o => o && o.toJSON());
    };

    app.model.roles = model;

    model.associate = () => {
        app.model.roles.belongsTo(app.model.users, {
            as: 'users',
            foreignKey: 'userId',
            targetKey: 'id',
            constraints: false,
        });
    };
    return model;
};
