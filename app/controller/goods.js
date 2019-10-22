/* eslint-disable no-magic-numbers */
'use strict';

const datas = require('./goodsData.js');
const Controller = require('../core/controller.js');

const Goods = class extends Controller {
    get modelName() {
        return 'goods';
    }

    async create() {
        return this.success('OK');
    }
    async destroy() {
        return this.success('OK');
    }
    async update() {
        return this.success('OK');
    }

    async index() {
        const query = this.validate();

        this.formatQuery(query);

        const list = await this.model.goods.findAll({
            ...this.queryOptions,
            where: query,
        });

        return this.success(list);
    }

    async importOldData() {
        const goods = [];
        for (let i = 0; i < datas.length; i++) {
            const data = datas[i];
            if (data.app_name.indexOf('魔法哈奇') !== 0) continue;
            goods.push({
                goodsId: data.app_goods_id,
                platform: data.app_name === '魔法哈奇' ? 1 : 2,
                thumbnail: data.thumbnail,
                subject: data.subject,
                body: data.body,
                rmb: data.price,
                min: data.min_buy_count,
                max: data.max_buy_count,
                callback:
                    data.app_name === '魔法哈奇'
                        ? 'http://192.168.15.148:56888/HttpPayHandle.lua'
                        : 'http://115.29.230.154:56888/HttpPayHandle.lua',
            });
        }
        // console.log(goods);
        await this.model.goods.bulkCreate(goods);

        return this.success('OK');
    }
};

module.exports = Goods;
