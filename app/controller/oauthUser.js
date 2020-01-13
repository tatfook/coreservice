/* eslint-disable no-magic-numbers */
'use strict';

const queryString = require('query-string');

const Controller = require('../core/controller.js');
const {
    OAUTH_SERVICE_TYPE_QQ,
    OAUTH_SERVICE_TYPE_WEIXIN,
    OAUTH_SERVICE_TYPE_GITHUB,
    OAUTH_SERVICE_TYPE_XINLANG,
} = require('../core/consts.js');

const OauthUsers = class extends Controller {
    get modelName() {
        return 'oauthUsers';
    }

    getConfig() {
        return this.app.config.self;
    }

    async destroy() {
        const { userId } = this.authenticated();
        const { id, password } = await this.ctx.validate(
            this.app.validator.oauthUser.delete,
            this.getParams()
        );

        const user = await this.model.users.findOne({
            where: { id: userId, password: this.app.util.md5(password) },
        });

        if (!user) return this.fail(11);

        await this.model.oauthUsers.destroy({ where: { userId, id } });

        return this.success('OK');
    }

    async qq() {
        const { axios } = this;
        const config = this.getConfig();
        const accessTokenApiUrl = 'https://graph.qq.com/oauth2.0/token';
        const openidApiUrl = 'https://graph.qq.com/oauth2.0/me';
        const userApiUrl = 'https://graph.qq.com/user/get_user_info';
        const params = await this.ctx.validate(
            this.app.validator.oauthUser.common,
            this.getParams()
        );
        const userId = this.getUser().userId;
        params.grant_type = 'authorization_code';
        params.client_id = params.clientId || config.oauths.qq.clientId;
        params.client_secret = config.oauths.qq.clientSecret;
        params.redirect_uri = params.redirectUri;
        // 获取token
        const queryStr = await axios
            .get(accessTokenApiUrl, { params })
            .then(res => res.data);
        const data = queryString.parse(queryStr);
        const access_token = data.access_token;
        // 获取openid
        let result = await axios
            .get(openidApiUrl, { params: { access_token } })
            .then(res => res.data);
        result = result.substring(
            result.indexOf('(') + 1,
            result.lastIndexOf(')')
        );
        result = JSON.parse(result);
        // 获取用户信息
        const externalId = result.openid;
        result = await axios
            .get(userApiUrl, {
                params: {
                    access_token,
                    oauth_consumer_key: params.client_id,
                    openid: externalId,
                },
            })
            .then(res => res.data);
        // 更新DB
        const externalUsername = result.nickname;
        const type = OAUTH_SERVICE_TYPE_QQ;
        const token = externalId + type + access_token;

        await this.getTokenByOauth(
            externalId,
            externalUsername,
            type,
            userId,
            token,
            params.state
        );
    }

    async getTokenByOauth(
        externalId,
        externalUsername,
        type,
        userId,
        token,
        state
    ) {
        let oauthUser = await this.model.oauthUsers.findOne({
            where: { externalId, type },
        });

        if (oauthUser) {
            if (userId && userId !== oauthUser.userId) {
                return this.fail(21);
            }
            const updateBody = { externalUsername, type, userId, token };
            if (!userId) {
                delete updateBody.userId;
            }
            await this.model.oauthUsers.update(updateBody, {
                where: { id: oauthUser.id },
            });
            oauthUser = await this.model.oauthUsers.findOne({
                where: { id: oauthUser.id },
            });
        } else {
            oauthUser = await this.model.oauthUsers.create({
                externalId,
                externalUsername,
                type,
                userId,
                token,
            });
        }
        oauthUser = oauthUser.get({ plain: true });
        return this.token(state, oauthUser);
    }

    async weixin() {
        const { axios } = this;
        const config = this.getConfig();
        const accessTokenApiUrl =
            'https://api.weixin.qq.com/sns/oauth2/access_token';
        const userApiUrl = 'https://api.weixin.qq.com/sns/userinfo';
        const params = await this.ctx.validate(
            this.app.validator.oauthUser.common,
            this.getParams()
        );
        const userId = this.getUser().userId;
        params.grant_type = 'authorization_code';
        params.client_id = params.clientId || config.oauths.weixin.clientId;
        params.appid =
            params.appid ||
            config.oauths.weixin.appid ||
            config.oauths.weixin.clientId;
        params.secret = config.oauths.weixin.clientSecret;
        params.redirect_uri = params.redirectUri;
        // 获取token
        const data = await axios
            .get(accessTokenApiUrl, { params })
            .then(res => res.data);
        const access_token = data.access_token;
        const externalId = data.openid;
        // // 获取用户信息
        const result = await axios
            .get(userApiUrl, { params: { access_token, openid: externalId } })
            .then(res => res.data);
        // 更新DB
        const externalUsername = result.nickname;
        const type = OAUTH_SERVICE_TYPE_WEIXIN;
        const token = externalId + type + access_token;
        await this.getTokenByOauth(
            externalId,
            externalUsername,
            type,
            userId,
            token,
            params.state
        );
    }

    async github() {
        const { axios } = this;
        const config = this.getConfig();
        const accessTokenApiUrl = 'https://github.com/login/oauth/access_token';
        const userApiUrl = 'https://api.github.com/user';
        const params = await this.ctx.validate(
            this.app.validator.oauthUser.common,
            this.getParams()
        );
        const userId = this.getUser().userId;
        params.client_id = params.clientId || config.oauths.github.clientId;
        params.client_secret = config.oauths.github.clientSecret;
        params.redirect_uri = params.redirectUri;
        const queryStr = await axios
            .get(accessTokenApiUrl, { params })
            .then(res => res.data);
        const data = queryString.parse(queryStr);

        const access_token = data.access_token;
        const userinfo = await axios
            .get(userApiUrl, { params: { access_token } })
            .then(res => res.data);
        const externalId = userinfo.id;
        const externalUsername = userinfo.login;
        const type = OAUTH_SERVICE_TYPE_GITHUB;

        const token = externalId + type + access_token;
        await this.getTokenByOauth(
            externalId,
            externalUsername,
            type,
            userId,
            token,
            params.state
        );
    }

    async xinlang() {
        const { axios } = this;
        const config = this.getConfig();
        const accessTokenApiUrl = 'https://api.weibo.com/oauth2/access_token';
        const userApiUrl = 'https://api.weibo.com/2/users/show.json';
        const params = await this.ctx.validate(
            this.app.validator.oauthUser.common,
            this.getParams()
        );
        const userId = this.getUser().userId;
        params.grant_type = 'authorization_code';
        params.client_id = params.clientId || config.oauths.xinlang.clientId;
        params.client_secret = config.oauths.xinlang.clientSecret;
        params.redirect_uri = params.redirectUri;

        const data = await axios
            .post(
                // eslint-disable-next-line max-len
                `${accessTokenApiUrl}?client_id=${params.client_id}&client_secret=${params.client_secret}&grant_type=authorization_code&code=${params.code}&redirect_uri=${params.redirect_uri}`,
                params
            )
            .then(res => res.data);
        const access_token = data.access_token;
        const externalId = data.uid;

        const userinfo = await axios
            .get(userApiUrl, { params: { access_token, uid: externalId } })
            .then(res => res.data);
        const externalUsername = userinfo.screen_name;
        const type = OAUTH_SERVICE_TYPE_XINLANG;

        const token = externalId + type + access_token;
        await this.getTokenByOauth(
            externalId,
            externalUsername,
            type,
            userId,
            token,
            params.state
        );
    }

    async token(state, oauthUser) {
        // 绑定直接返回
        const config = this.getConfig();

        if (state !== 'login') return this.success({ token: oauthUser.token });
        if (!oauthUser.userId) return this.success({ token: oauthUser.token });
        let user = await this.model.users.findOne({
            where: { id: oauthUser.userId },
        });
        if (!user) return this.success({ token: oauthUser.token });
        user = user.get({ plain: true });

        const token = this.util.jwt_encode(
            {
                userId: user.id,
                roleId: user.roleId,
                username: user.username,
                oauthUserId: oauthUser.id,
            },
            config.secret,
            config.tokenExpire
        );

        user.token = token;
        // user.roleId = roleId;
        this.ctx.cookies.set('token', user.token, {
            httpOnly: false,
            maxAge: config.tokenExpire * 1000,
            overwrite: true,
            domain: '.' + config.domain,
        });

        await this.ctx.service.user.setToken(user.id, token);

        return this.success(user);
    }
};

module.exports = OauthUsers;
