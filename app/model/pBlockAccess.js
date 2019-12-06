/* eslint-disable no-magic-numbers */
'use strict';
module.exports = app => {
    const { INTEGER } = app.Sequelize;

    const model = app.model.define(
        'pBlockAccesses',
        {
            id: {
                type: INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            pBlockId: {
                type: INTEGER,
                allowNull: false,
                comment: '',
                unique: true,
            },
            commonUser: {
                type: INTEGER(2),
                allowNull: true,
                defaultValue: '0',
                comment:
                    '普通用户或者游客的权限，0表示不可见，1表示可见，2表示可用',
            },
            vip: {
                type: INTEGER(2),
                allowNull: true,
                defaultValue: '0',
                comment: 'vip用户，0表示不可见，1表示可见，2表示可用',
            },
            t1: {
                type: INTEGER(2),
                allowNull: true,
                defaultValue: '0',
                comment: 't1用户，0表示不可见，1表示可见，2表示可用',
            },
            t2: {
                type: INTEGER(2),
                allowNull: true,
                defaultValue: '0',
                comment: 't2用户，0表示不可见，1表示可见，2表示可用',
            },
            t3: {
                type: INTEGER(2),
                allowNull: true,
                defaultValue: '0',
                comment: 't3用户，0表示不可见，1表示可见，2表示可用',
            },
            t4: {
                type: INTEGER(2),
                allowNull: true,
                defaultValue: '0',
                comment: 't4用户，0表示不可见，1表示可见，2表示可用',
            },
            t5: {
                type: INTEGER(2),
                allowNull: true,
                defaultValue: '0',
                comment: 't5用户，0表示不可见，1表示可见，2表示可用',
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
            comment: '元件库的权限',
        }
    );

    app.model.pBlockAccesses = model;

    model.associate = () => {
        app.model.pBlockAccesses.belongsTo(app.model.pBlocks, {
            as: 'pBlock',
            foreignKey: 'pBlockId',
            sourceKey: 'id',
            constraints: false,
        });
    };

    return model;
};
