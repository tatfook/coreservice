'use strict';

module.exports = app => {
    const { BIGINT, INTEGER } = app.Sequelize;

    const model = app.model.define(
        'userLimits',
        {
            id: {
                type: INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: BIGINT,
                allowNull: false,
                comment: '用户id',
                unique: true,
            },
            world: {
                type: INTEGER,
                allowNull: false,
                comment: '世界的数量上限',
                defaultValue: '0',
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
        }
    );

    model.getByUserId = async userId => {
        const data = await app.model.userLimits.findOne({
            where: { userId },
            attributes: [ 'world' ],
        });

        return data && data.get({ plain: true });
    };
    app.model.userLimits = model;

    model.associate = () => {
        app.model.userLimits.belongsTo(app.model.users, {
            as: 'users',
            foreignKey: 'userId',
            targetKey: 'id',
            constraints: false,
        });
    };

    return model;
};
