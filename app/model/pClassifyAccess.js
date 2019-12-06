/* eslint-disable no-magic-numbers */
'use strict';
module.exports = app => {
    const { INTEGER } = app.Sequelize;

    const model = app.model.define(
        'pClassifyAccesses',
        {
            id: {
                type: INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            pClassifyId: {
                type: INTEGER,
                allowNull: false,
                comment: '',
                unique: true,
            },
            commonUser: {
                type: INTEGER(2),
                allowNull: true,
                defaultValue: '0',
                comment: '普通用户或者游客的权限，0表示不可见，1表示可见',
            },
            vip: {
                type: INTEGER(2),
                allowNull: true,
                defaultValue: '0',
                comment: 'vip用户，0表示不可见，1表示可见',
            },
            t1: {
                type: INTEGER(2),
                allowNull: true,
                defaultValue: '0',
                comment: 't1用户，0表示不可见，1表示可见',
            },
            t2: {
                type: INTEGER(2),
                allowNull: true,
                defaultValue: '0',
                comment: 't2用户，0表示不可见，1表示可见',
            },
            t3: {
                type: INTEGER(2),
                allowNull: true,
                defaultValue: '0',
                comment: 't3用户，0表示不可见，1表示可见',
            },
            t4: {
                type: INTEGER(2),
                allowNull: true,
                defaultValue: '0',
                comment: 't4用户，0表示不可见，1表示可见',
            },
            t5: {
                type: INTEGER(2),
                allowNull: true,
                defaultValue: '0',
                comment: 't5用户，0表示不可见，1表示可见',
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
            comment: '元件库分类的权限',
        }
    );

    app.model.pClassifyAccesses = model;

    model.associate = () => {
        app.model.pClassifyAccesses.belongsTo(app.model.pClassifies, {
            as: 'pClassifies',
            foreignKey: 'pClassifyId',
            sourceKey: 'id',
            constraints: false,
        });
    };

    return model;
};
