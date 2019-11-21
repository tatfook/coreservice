/* eslint-disable no-magic-numbers */
'use strict';
const _ = require('lodash');
const { USER_ATTRS } = require('../core/consts');
module.exports = app => {
    const { BIGINT, INTEGER, STRING, JSON } = app.Sequelize;

    const attrs = {
        id: {
            type: BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },

        username: {
            type: STRING(48),
            unique: true,
            allowNull: false,
        },

        password: {
            type: STRING(48),
            allowNull: false,
        },

        roleId: {
            type: INTEGER,
            defaultValue: 0,
        },

        channel: {
            // 注册渠道 0 -- keepwork 1 -- haqi 2 -- haqi2 3 -- paracraft  4 -- qq hall
            type: INTEGER,
            defaultValue: 0,
        },

        email: {
            // 邮箱
            type: STRING(64),
            unique: true,
        },

        cellphone: {
            // 绑定手机号
            type: STRING(24),
            unique: true,
        },

        realname: {
            // 实名手机号
            type: STRING(24),
        },

        nickname: {
            // 昵称
            type: STRING(48),
        },

        portrait: {
            type: STRING(1024),
        },

        sex: {
            type: STRING(4),
        },

        description: {
            type: STRING(512),
        },

        extra: {
            type: JSON,
            defaultValue: {},
        },

        vip: {
            type: INTEGER(2),
            defaultValue: 0,
            comments: '是否是VIP，0否，1是',
        },

        tLevel: {
            type: INTEGER(2),
            defaultValue: 0,
            comments: '教师级别,0表示T0,1表示T1,依次类推',
        },
    };

    const opts = {
        underscored: false,
        charset: 'utf8mb4',
        collate: 'utf8mb4_bin',
    };

    app.model.illegalUsers = app.model.define('illegalUsers', attrs, opts);

    const model = app.model.define('users', attrs, opts);

    // model.sync({force:true});

    model.get = async function(id) {
        if (_.toNumber(id)) {
            return await this.getById(_.toNumber(id));
        }

        return await this.getByName(id);
    };

    model.getByName = async function(username) {
        const data = await app.model.users.findOne({
            where: { username },
            attributes: {
                exclude: [ 'password' ],
            },
        });

        return data && data.get({ plain: true });
    };

    model.getBaseInfoById = async function(userId) {
        const data = await app.model.users.findOne({
            where: { id: userId },
            attributes: USER_ATTRS,
        });
        if (!data) return {};

        const user = data.get({ plain: true });
        user.id = user.userId;

        return user;
    };

    model.getById = async function(userId) {
        const data = await app.model.users.findOne({
            where: { id: userId },
            attributes: {
                exclude: [ 'password' ],
            },
        });

        return data && data.get({ plain: true });
    };

    model.getUsers = async function(userIds = []) {
        const list = await app.model.users.findAll({
            attributes: USER_ATTRS,
            where: {
                id: {
                    [app.Sequelize.Op.in]: userIds,
                },
            },
        });

        const users = {};
        _.each(list, o => {
            o = o.get ? o.get({ plain: true }) : o;
            users[o.userId] = o;
        });

        return users;
    };

    app.model.users = model;
    return model;
};
