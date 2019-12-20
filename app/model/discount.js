/* eslint-disable no-magic-numbers */
'use strict';
const _ = require('lodash');
const {
    DISCOUNT_TYPE_DEFAULT,
    DISCOUNT_TYPE_PACKAGE,
} = require('../core/consts.js');

module.exports = app => {
    const { BIGINT, INTEGER, STRING, JSON } = app.Sequelize;

    const model = app.model.define(
        'discounts',
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

            type: {
                // 优惠券类型  0 - 通用性  1 - 课程包
                type: INTEGER,
                defaultValue: 0,
            },

            state: {
                // 状态
                type: INTEGER,
                defaultValue: 0,
            },

            rmb: {
                // 满人民币可使用
                type: INTEGER,
                defaultValue: 0,
            },

            coin: {
                // 满知识币可使用
                type: INTEGER,
                defaultValue: 0,
            },

            bean: {
                // 满知识豆可使用
                type: INTEGER,
                defaultValue: 0,
            },

            rewardRmb: {
                // 奖励rmb
                type: INTEGER,
                defaultValue: 0,
            },

            rewardCoin: {
                // 奖励coin
                type: INTEGER,
                defaultValue: 0,
            },

            rewardBean: {
                // 奖励bean
                type: INTEGER,
                defaultValue: 0,
            },

            title: {
                // 优惠券标题
                type: STRING,
                defaultValue: '',
            },

            description: {
                // 优惠券描述  备注
                type: STRING,
                defaultValue: '',
            },

            startTime: {
                // 开始日期
                type: BIGINT,
            },

            endTime: {
                // 结束日期
                type: BIGINT,
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
        }
    );

    model.generateDiscount = function() {
        const startTime = new Date().getTime();
        const endTime = startTime + 1000 * 3600 * 24 * 30;
        const discounts = [
            {
                rmb: 100,
                rewardRmb: 5,
                type: DISCOUNT_TYPE_DEFAULT,
                startTime,
                endTime,
                title: '满100元可用',
                description: '通用券, Keepwork全平台通用',
                extra: {
                    enTitle: 'when you spend ￥100',
                    enDescription:
                        'General Coupons, Applying to all products on Keepwork',
                },
            },
            {
                rmb: 100,
                rewardRmb: 5,
                type: DISCOUNT_TYPE_PACKAGE,
                startTime,
                endTime,
                title: '满100元可用',
                description: '课程券, 仅限购买课程包使用',
                extra: {
                    enTitle: 'when you spend ￥100',
                    enDescription:
                        'Lesson Coupons, Only applying to lesson packages',
                },
            },
            {
                coin: 10,
                rewardCoin: 10,
                type: DISCOUNT_TYPE_DEFAULT,
                startTime,
                endTime,
                title: '满10知识币可用',
                description: '通用券, Keepwork全平台通用',
                extra: {
                    enTitle: 'when you spend 10 coins',
                    enDescription:
                        'General Coupons, Applying to all products on Keepwork',
                },
            },
            {
                bean: 10,
                rewardBean: 10,
                type: DISCOUNT_TYPE_DEFAULT,
                startTime,
                endTime,
                title: '满10知识豆可用',
                description: '通用券, Keepwork全平台通用',
                extra: {
                    enTitle: 'when you spend 10 beans',
                    enDescription:
                        'General Coupons, Applying to all products on Keepwork',
                },
            },
        ];
        const discount = discounts[_.random(0, 3)];

        return discount;
    };

    app.model.discounts = model;

    return model;
};
