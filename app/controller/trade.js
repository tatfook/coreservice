const joi = require("joi");
const _ = require("lodash");
const moment = require("moment");
const uuidv1 = require('uuid/v1');
const axios = require("axios");

const Controller = require("../core/controller.js");
const {
	TRADE_TYPE_DEFAULT,
	TRADE_TYPE_HAQI_EXCHANGE,
	TRADE_TYPE_PACKAGE_BUY,

	DISCOUNT_STATE_UNUSE,
	DISCOUNT_STATE_USED,
	DISCOUNT_STATE_EXPIRED,

	DISCOUNT_TYPE_DEFAULT,
	DISCOUNT_TYPE_PACKAGE,
} = require("../core/consts.js");

const Trade = class extends Controller {
	get modelName() {
		return "trades";
	}

	async create() {
		const {userId, username} = this.authenticated();
		const params = this.validate({
			type: joi.number().valid([TRADE_TYPE_DEFAULT, TRADE_TYPE_HAQI_EXCHANGE, TRADE_TYPE_PACKAGE_BUY]),                      // 交易类型  课程包购买  哈奇物品兑换
			goodsId: "int",                   // 物品id
			count: "int",                     // 购买量
			discountId: "int_optional",       // 优惠券id
			rmb: "int_optional",
			coin: "int_optional",
			bean: "int_optional",
		});
		const {type, goodsId, count, discountId=0, extra={}} = params;

		if (count < 0) return this.throw(400);

		const goods = await this.model.goods.findOne({where:{id: goodsId}}).then(o => o && o.toJSON());
		if (!goods || !goods.callback) return this.throw(400);

		const callbackData = this.validate(goods.callbackData, extra); // extra 为回调所需数据   goods.callbackData为回调数据schema

		const account = await this.model.accounts.findOne({where:{userId}}).then(o => o && o.toJSON());
		if (!account) return this.throw(500);
		
		let discount = await this.model.discounts.findOne({where:{id: discountId, userId, state:DISCOUNT_STATE_UNUSE}}).then(o => o && o.toJSON());
		if (discountId && !discount) return this.throw(400, "优惠券不存在");

		const user = await this.model.users.getById(userId);
		if (!user) return this.fail(12);

		const rmb = (params.rmb == undefined ? goods.rmb : params.rmb) * count;
		const coin = (params.coin == undefined ? goods.coin : params.coin) * count;
		const bean = (params.bean == undefined ? goods.bean : params.bean) * count;
		let realRmb = rmb;
		let realCoin = coin;
		let realBean = bean;
		
		if (rmb > 200) {  // 验证手机验证码
			if (!user.cellphone) return this.fail(5);
			const cache = await this.model.caches.get(user.cellphone);
			if (!params.captcha || !cache || cache.captcha != params.captcha) return this.fail(5);
		}

		if (discount) {
			const types = {TRADE_TYPE_PACKAGE_BUY: DISCOUNT_TYPE_PACKAGE};
			if (discount.type != DISCOUNT_TYPE_DEFAULT && types[type] !== discount.type) return this.throw(400, "优惠券不可用");
			if (rmb < discount.rmb || coin < discount.coin || bean < discount.bean) return this.throw(400, "优惠券不满足使用条件");
			const curtime = new Date().getTime();
			const starttime = discount.startTime;
			const endtime = discount.endTime;
			if (curtime < starttime || curtime >= endtime) return this.throw(400, "优惠券已过期");

			realRmb -= discount.rewardRmb;
			realCoin -= discount.rewardCoin;
			realBean -= discount.rewardBean;
		}

		if (account.rmb < realRmb || account.coin < realCoin || account.bean < realBean) {
			return this.fail(13);
		}
		
		// 更新用户余额
		const ret = await this.model.accounts.update({rmb:account.rmb - realRmb, coin: account.coin - realCoin, bean: account.bean - realBean}, {where: {
			userId, 
			rmb: {[this.model.Op.gte]: realRmb},
			coin: {[this.model.Op.gte]: realCoin},
			bean: {[this.model.Op.gte]: realBean},
		}});
		if (ret[0] != 1) {
			return this.fail(13);
		}

		let success = true;
		let errinfo = "";
		// 签名内容
		const sigcontent = uuidv1().replace(/-/g, "");
		const headers = {
			"x-keepwork-signature": this.util.rsaEncrypt(this.config.self.rsa.privateKey, sigcontent),
			"x-keepwork-sigcontent": sigcontent,
		};
		const fail = (e) => {
			console.log(e);
			success = false;
			errinfo = "statusCode:" + e.response.status + " data:" + e.response.data;
			//this.model.logs.debug(errinfo);
		};
		callbackData.amount = {rmb, coin, bean};
		callbackData.userId = params.userId || userId;  // 可帮别人买
		callbackData.count = count;
		callbackData.goods = goods;
		
		if (type == TRADE_TYPE_HAQI_EXCHANGE) {              // 哈奇兑换
			const params = {url:'Pay', username, gsid:goods.goodsId, count, money: bean, method:"1", orderno: goods.id, from:"0", price:goods.bean, user_nid:callbackData.user_nid};
			await axios.get(goods.callback, {params, headers}).then(res => {
				//console.log(res);
				//if (res.status != 200 || !res.data) {
					//success = false;
					//errinfo = "响应内容为空";
				//}
			}).catch(fail);
		} else {
			await axios.post(goods.callback, callbackData, {headers}).then(e => {
				//console.log(e);
			}).catch(fail);
		}

		if (!success) {
			await this.model.accounts.increment({rmb:realRmb, coin:realCoin, bean:realBean}, {where: {userId}});
			return this.throw(500, errinfo);
		}
		
		// 设置已使用优惠券
		if (discount) await this.model.discounts.update({state:DISCOUNT_STATE_USED}, {where:{id: discount.id}});

		// 创建交易记录
		const trade = await this.model.trades.create({
			userId, type, goodsId, count, discount,
			rmb, coin, bean, realRmb, realCoin, realBean,
			subject: goods.subject,  body: goods.body,
		});

		discount = this.model.discounts.generateDiscount();
		discount.userId = userId;
		discount = await this.model.discounts.create(discount);

		return this.success({trade, discount});
	}
}

module.exports = Trade;

