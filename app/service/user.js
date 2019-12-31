/* eslint-disable no-magic-numbers */
'use strict';
const _ = require('lodash');
const Service = require('egg').Service;

class User extends Service {
    // 简化用户信息
    getSimpleUser() {}

    async getUser({ userId, username, cellphone, email }) {
        const user = await this.app.model.users
            .findOne({
                where: {
                    $or: [
                        { id: _.toNumber(userId) || 0 },
                        // {userId: (_.toNumber(kid) || 0) - 10000},
                        { username },
                        { cellphone },
                        { email },
                    ],
                },
            })
            .then(o => o && o.toJSON());

        if (!user) return;

        user.isRealname = !!user.realname;
        user.cellphone = undefined;
        user.email = undefined;
        user.password = undefined;
        user.realname = undefined;
        user.roleId = undefined;
        user.sex = undefined;

        return user;
    }

    async getUserByUserId(userId) {
        return await this.app.model.users
            .findOne({ where: { id: userId } })
            .then(o => o && o.toJSON());
    }

    async getUserinfoByUserId(userId) {
        const userinfo = await this.app.model.userinfos
            .findOne({ where: { userId } })
            .then(o => o && o.toJSON());
        if (!userinfo) await this.app.userinfos.upsert({ userId });
        return userinfo;
    }

    async token(payload, clear) {
        const config = this.app.config.self;
        const tokenExpire = config.tokenExpire || 3600 * 24 * 2;
        const token = this.app.util.jwt_encode(
            payload,
            config.secret,
            tokenExpire
        );

        await this.setToken(payload.userId, token, clear);

        return token;
    }

    async setToken(userId, token, clear = false) {
        this.ctx.state.user = { userId };

        const data = await this.app.model.userdatas.get(userId);

        data.tokens = data.tokens || [];
        if (clear) data.tokens = [];

        data.tokens.splice(0, 0, token);
        // 只支持10个token
        if (data.tokens.length > 20) data.tokens.pop();
        await this.app.model.userdatas.set(userId, data);
    }

    async validateToken(userId, token) {
        const data = await this.app.model.userdatas.get(userId);
        const tokens = data.tokens || [];
        // console.log(userId, data, token);
        return !!_.find(tokens, o => o === token);
    }

    async createRegisterMsg(user) {
        return this.app.api.lesson.createRegisterMsg(user);
    }

    async register(user) {
        await this.createRegisterMsg(user);
    }
    /**
     * 往列表里面加user的属性
     * @param {Array<{userId}>} list 列表
     */
    async addUserAttrByUserIds(list) {
        const userIds = [];

        _.each(list, (o, i) => {
            o = o.get ? o.get({ plain: true }) : o;
            userIds.push(o.userId);
            list[i] = o;
        });
        const users = await this.app.model.users.getUsers(userIds);

        _.each(list, o => {
            o.user = users[o.userId];
        });
    }

    /**
     * 获取用户的世界限制
     * @param {*} userId 用户ID
     * @return {Promise<{usedWorld, world}>} usedWorld已使用的world数量，world创建world的上限
     */
    async getUserWorldLimit(userId) {
        const user = await this.ctx.model.users.getById(userId);
        const userRank = await this.ctx.model.userRanks.getByUserId(userId);
        const userLimit = await this.ctx.model.userLimits.getByUserId(userId);
        // 用户是vip或者tLevel则无限制
        if (user.vip || user.tLevel) {
            userLimit.world = -1;
        }
        userLimit.usedWorld = userRank.world;
        return userLimit;
    }
}

module.exports = User;
