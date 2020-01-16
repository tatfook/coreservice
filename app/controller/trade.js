/* eslint-disable no-magic-numbers */
'use strict';
const uuidv1 = require('uuid/v1');
const axios = require('axios');

const Controller = require('../core/controller.js');
const {
    TRADE_TYPE_PACKAGE_BUY,

    DISCOUNT_STATE_UNUSE,
    DISCOUNT_STATE_USED,

    DISCOUNT_TYPE_DEFAULT,
    DISCOUNT_TYPE_PACKAGE,
} = require('../core/consts.js');

const Trade = class extends Controller {
    get modelName() {
        return 'trades';
    }

    async create() {
        const { userId, username } = this.authenticated();
        const params = await this.ctx.validate(
            this.app.validator.trade.create,
            this.getParams()
        );
        const { type, goodsId, count, discountId = 0, extra = {} } = params;
        // count 为10的整数倍
        if (count <= 0 || count % 10) return this.throw(400);

        const goods = await this.model.goods
            .findOne({ where: { id: goodsId } })
            .then(o => o && o.toJSON());
        if (!goods || !goods.callback) return this.throw(400);

        const callbackData = this.validate(goods.callbackData, extra); // extra 为回调所需数据   goods.callbackData为回调数据schema

        const account = await this.model.accounts
            .findOne({ where: { userId } })
            .then(o => o && o.toJSON());
        if (!account) return this.throw(500);

        let discount = await this.model.discounts
            .findOne({
                where: { id: discountId, userId, state: DISCOUNT_STATE_UNUSE },
            })
            .then(o => o && o.toJSON());
        if (discountId && !discount) return this.throw(400, '优惠券不存在');

        const user = await this.model.users.getById(userId);
        if (!user) return this.fail(12);

        const rmb = goods.rmb * count;
        const coin = goods.coin * count;
        const bean = goods.bean * count;
        let realRmb = rmb;
        let realCoin = coin;
        let realBean = bean;

        if (discount) {
            const types = { [TRADE_TYPE_PACKAGE_BUY]: DISCOUNT_TYPE_PACKAGE };
            if (
                discount.type !== DISCOUNT_TYPE_DEFAULT &&
                types[type] !== discount.type
            ) {
                return this.throw(400, '优惠券不可用');
            }
            if (
                rmb < discount.rmb ||
                coin < discount.coin ||
                bean < discount.bean
            ) {
                return this.throw(400, '优惠券不满足使用条件');
            }
            const curtime = new Date().getTime();
            const starttime = discount.startTime;
            const endtime = discount.endTime;
            if (curtime < starttime || curtime >= endtime) {
                return this.throw(400, '优惠券已过期');
            }

            realRmb -= discount.rewardRmb;
            realCoin -= discount.rewardCoin;
            realBean -= discount.rewardBean;
        }

        if (
            account.rmb < realRmb ||
            account.coin < realCoin ||
            account.bean < realBean
        ) {
            return this.fail(13);
        }

        // 更新用户余额
        const ret = await this.model.accounts.update(
            {
                rmb: account.rmb - realRmb,
                coin: account.coin - realCoin,
                bean: account.bean - realBean,
            },
            {
                where: {
                    userId,
                    rmb: { [this.model.Op.gte]: realRmb },
                    coin: { [this.model.Op.gte]: realCoin },
                    bean: { [this.model.Op.gte]: realBean },
                },
            }
        );
        if (ret[0] !== 1) {
            return this.fail(13);
        }

        let success = true;
        let errinfo = '';
        // 签名内容
        const sigcontent = uuidv1().replace(/-/g, '');
        const headers = {
            'x-keepwork-signature': this.util.rsaEncrypt(
                this.config.self.rsa.privateKey,
                sigcontent
            ),
            'x-keepwork-sigcontent': sigcontent,
        };
        const fail = e => {
            this.logger.error(e);
            success = false;
            errinfo =
                'statusCode:' + e.response.status + ' data:' + e.response.data;
            // this.model.logs.debug(errinfo);
        };
        callbackData.amount = { rmb, coin, bean };
        callbackData.userId = params.userId || userId; // 可帮别人买
        callbackData.count = count;
        callbackData.goods = goods;

        if (goods.platform === 2 || goods.platform === 3) {
            // 哈奇兑换
            const params = {
                url: 'Pay',
                username,
                gsid: goods.goodsId,
                count,
                money: rmb * 100,
                method: '1',
                orderno: userId + '' + new Date().getTime(),
                from: '0',
                price: goods.bean,
                user_nid: callbackData.user_nid,
            };
            await axios
                .get(goods.callback, { params, headers })
                .then(res => {
                    if (/,result=0,/.test(res.data)) return;
                    success = false;
                    errinfo = '兑换失败';
                })
                .catch(fail);
        } else {
            await axios
                .post(goods.callback, callbackData, { headers })
                .then(e => {
                    this.logger.error(e);
                })
                .catch(fail);
        }

        if (!success) {
            await this.model.accounts.increment(
                { rmb: realRmb, coin: realCoin, bean: realBean },
                { where: { userId } }
            );
            return this.throw(500, errinfo);
        }

        // 设置已使用优惠券
        if (discount) {
            await this.model.discounts.update(
                { state: DISCOUNT_STATE_USED },
                { where: { id: discount.id } }
            );
        }

        // 创建交易记录
        const trade = await this.model.trades.create({
            userId,
            type,
            goodsId,
            count,
            discount,
            rmb,
            coin,
            bean,
            realRmb,
            realCoin,
            realBean,
            subject: params.subject || goods.subject,
            body: params.body || goods.body,
        });

        discount = this.model.discounts.generateDiscount();
        discount.userId = userId;
        discount = await this.model.discounts.create(discount);

        return this.success({ trade, discount });
    }
};

module.exports = Trade;
