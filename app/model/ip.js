/* eslint-disable no-magic-numbers */
'use strict';

module.exports = app => {
    const { BIGINT, STRING } = app.Sequelize;

    const model = app.model.define(
        'ips',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            type: {
                // ipv4 ipv6
                type: STRING(16),
                defaultValue: 'ipv4',
            },

            start: {
                // 起始值
                type: BIGINT,
                defaultValue: 0,
            },

            end: {
                // 结束值
                type: BIGINT,
                defaultValue: 0,
            },

            cc: {
                // 国家
                type: STRING(8),
                defaultValue: 'CN',
            },

            ip: {
                // 实际IP
                type: STRING(24),
                defaultValue: '',
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
        }
    );

    // model.sync({force:true});

    app.model.ips = model;

    return model;
};
