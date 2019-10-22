'use strict';
const _ = require('lodash');

module.exports = app => {
    const { BIGINT, INTEGER, STRING, JSON } = app.Sequelize;

    const model = app.model.define(
        'lessonOrganizationClassMembers',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            organizationId: {
                type: BIGINT,
                defaultValue: 0,
            },

            classId: {
                // 0 -- 则为机构成员
                type: BIGINT,
                defaultValue: 0,
            },

            memberId: {
                // 成员id
                type: BIGINT,
                defaultValue: 0,
            },

            realname: {
                // 真实姓名
                type: STRING,
            },

            // bind: {                      // 是否绑定机构
            // type: INTEGER,
            // defaultValue: 0,
            // },

            roleId: {
                // 角色  1 -- 学生  2 -- 教师  64 -- 管理员
                type: INTEGER,
                defaultValue: 0,
            },

            privilege: {
                // 权限
                type: INTEGER,
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
                    name: 'organizationId-classId-memberId',
                    unique: true,
                    fields: [ 'organizationId', 'classId', 'memberId' ],
                },
            ],
        }
    );

    // model.sync({force:true});

    model.getClasses = async function({ memberId, roleId, organizationId }) {
        const sql =
            'select classId from lessonOrganizationClassMembers where organizationId = :organizationId and memberId = :memberId and roleId & :roleId';
        const list = await app.model.query(sql, {
            type: app.model.QueryTypes.SELECT,
            replacements: {
                organizationId,
                memberId,
                roleId,
            },
        });
        const classIds = _.uniq(_.map(list, o => o.classId));

        const classes = await app.model.lessonOrganizationClasses
            .findAll({
                where: {
                    id: { $in: classIds },
                    end: { $gt: new Date() },
                },
            })
            .then(list => list.map(o => o.toJSON()));

        return classes;
    };

    model.getAllClassIds = async function({
        memberId,
        roleId,
        organizationId,
    }) {
        const sql =
            'select classId from lessonOrganizationClassMembers where organizationId = :organizationId and memberId = :memberId and roleId & :roleId';
        const list = await app.model.query(sql, {
            type: app.model.QueryTypes.SELECT,
            replacements: {
                organizationId,
                memberId,
                roleId,
            },
        });
        const classIds = _.uniq(_.map(list, o => o.classId));

        return classIds;
    };

    app.model.lessonOrganizationClassMembers = model;

    return model;
};
