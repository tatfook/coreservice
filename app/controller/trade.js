const joi = require("joi");
const _ = require("lodash");
const moment = require("moment");
const uuidv1 = require('uuid/v1');
const axios = require("axios");

const Controller = require("../core/controller.js");
const {
	TRADE_TYPE_CHARGE,
	TRADE_TYPE_EXCHANGE,
	TRADE_TYPE_PACKAGE_BUY,
	TRADE_TYPE_LESSON_STUDY,

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
		const {userId} = this.authenticated();
		const params = this.validate({
			type: "int",                      // 交易类型  课程包购买  哈奇物品兑换
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
		
		const discount = await this.model.discounts.findOne({where:{id: discountId, userId, state:DISCOUNT_STATE_UNUSE}}).then(o => o && o.toJSON());
		if (discountId && !discount) return this.throw(400, "优惠券不存在");

		const user = await this.model.users.getById(userId);
		if (!user) return this.fail(12);

		const rmb = (params.rmb || goods.rmb) * count;
		const coin = (params.coin || goods.coin) * count;
		const bean = (params.bean || goods.bean) * count;
		let realRmb = rmb;
		let realCoin = coin;
		let realBean = bean;
		
		if (rmb > 0) {  // 验证手机验证码
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

		try {
			callbackData.amount = {rmb, coin, bean};
			callbackData.userId = params.userId || userId;  // 可帮别人买

			// 签名内容
			const sigcontent = uuidv1().replace(/-/g, "");
			await axios.post(goods.callback, callbackData, {
				headers: {
					"x-keepwork-signature": this.util.rsaEncrypt(this.config.self.rsa.privateKey, sigcontent),
					"x-keepwork-sigcontent": sigcontent,
				}
			});
		} catch(e) {
			console.log(callbackData);
			console.log(e);
			await this.model.accounts.increment({rmb:realRmb, coin:realCoin, bean:realBean}, {where: {userId}});
			return this.throw(500, "交易失败");
		}
		
		// 设置已使用优惠券
		if (discount) await this.model.discounts.update({state:DISCOUNT_STATE_USED}, {where:{id: discount.id}});

		// 创建交易记录
		await this.model.trades.create({
			userId, type, goodsId, count, discount,
			rmb, coin, bean, realRmb, realCoin, realBean,
			subject: goods.subject,  body: goods.body,
		});

		return this.success("OK");
	}
}

module.exports = Trade;
