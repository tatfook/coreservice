'use strict';
const {
    ENTITY_TYPE_USER,
    ENTITY_TYPE_SITE,
    ENTITY_TYPE_PAGE,
    ENTITY_TYPE_PROJECT,
} = require('../core/consts.js');

module.exports = app => {
    const { BIGINT, INTEGER, JSON } = app.Sequelize;

    const model = app.model.define(
        'favorites',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            userId: {
                type: BIGINT,
                allowNull: false,
            },

            objectId: {
                type: BIGINT,
                allowNull: false,
            },

            objectType: {
                type: INTEGER,
                allowNull: false,
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

            indexes: [
                {
                    unique: true,
                    fields: [ 'userId', 'objectId', 'objectType' ],
                },
            ],
        }
    );

    async function __hook__(inst, options) {
        const transaction = options.transaction;
        const { userId, objectId, objectType } = inst;
        if (objectType === ENTITY_TYPE_PROJECT) {
            // 获取项目收藏量
            const favorite = await app.model.favorites.count({
                where: { objectId, objectType },
                transaction,
            });
            await app.model.projects.update(
                { favorite },
                {
                    where: { id: objectId },
                    transaction,
                    individualHooks: true,
                }
            );
        } else if (objectType === ENTITY_TYPE_USER) {
            const follow = await app.model.favorites.count({
                where: { userId, objectType },
                transaction,
            });
            const fans = await app.model.favorites.count({
                where: { objectId, objectType },
                transaction,
            });
            await app.model.userRanks.update(
                { follow },
                { where: { userId }, transaction }
            );
            await app.model.userRanks.update(
                { fans },
                {
                    where: { userId: objectId },
                    transaction,
                }
            );
            const followingUser = await app.model.users.getById(
                userId,
                transaction
            );
            await app.api.es.upsertUser(followingUser, transaction);
            const followedUser = await app.model.users.getById(
                objectId,
                transaction
            );
            await app.api.es.upsertUser(followedUser, transaction);
        }
    }

    model.afterCreate(__hook__);
    model.afterDestroy(__hook__);

    // 获取粉丝
    model.getFollows = async function(objectId, objectType = ENTITY_TYPE_USER) {
        const sql = `select users.id, users.username, users.nickname, users.portrait, users.description, users.vip, users.tLevel
			from favorites, users
			where favorites.userId = users.id and objectType = :objectType and favorites.objectId = :objectId`;

        const result = await app.model.query(sql, {
            type: app.model.QueryTypes.SELECT,
            replacements: {
                objectType,
                objectId,
            },
        });

        return result;
    };

    // 关注
    model.getFollowing = async function(userId) {
        const sql = `select users.id, users.username, users.nickname, users.portrait, users.description, users.vip, users.tLevel
			from favorites, users
			where favorites.objectId = users.id and objectType = :objectType and favorites.userId = :userId`;

        const result = await app.model.query(sql, {
            type: app.model.QueryTypes.SELECT,
            replacements: {
                objectType: ENTITY_TYPE_USER,
                userId,
            },
        });

        return result;
    };

    // 获取收藏的站点
    model.getFavoriteSites = async function(userId) {
        const sql = `select sites.*
			from favorites, sites 
			where favorites.objectId = sites.id and objectType = :objectType and favorites.userId = :userId`;

        const result = await app.model.query(sql, {
            type: app.model.QueryTypes.SELECT,
            replacements: {
                objectType: ENTITY_TYPE_SITE,
                userId,
            },
        });

        return result;
    };

    // 获取收藏的页面
    model.getFavoritePages = async function(userId) {
        const sql = `select pages.*
			from favorites, pages 
			where favorites.objectId = pages.id and objectType = :objectType and favorites.userId = :userId`;

        const result = await app.model.query(sql, {
            type: app.model.QueryTypes.SELECT,
            replacements: {
                objectType: ENTITY_TYPE_PAGE,
                userId,
            },
        });

        return result;
    };

    model.favorite = async function(userId, objectId, objectType) {
        const transaction = await app.model.transaction();
        try {
            const favorite = await app.model.favorites.create(
                {
                    userId,
                    objectId,
                    objectType,
                },
                { transaction }
            );
            await transaction.commit();
            return favorite;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    };

    model.unfavorite = async function(userId, objectId, objectType) {
        const transaction = await app.model.transaction();
        try {
            const result = await app.model.favorites.destroy({
                where: { userId, objectId, objectType },
                transaction,
                individualHooks: true,
            });
            await transaction.commit();
            return result;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    };

    model.objectCount = async function(objectId, objectType) {
        return await app.model.favorites.count({
            where: { objectId, objectType },
        });
    };

    model.getStatistics = async function(userId) {
        // 粉丝
        const followsCount = await this.model.favorites.count({
            where: {
                objectId: userId,
                objectType: ENTITY_TYPE_USER,
            },
        });

        // 关注
        const followingCount = await this.model.favorites.count({
            where: {
                userId,
                objectType: ENTITY_TYPE_USER,
            },
        });

        // 站点
        const siteFavoriteCount = await this.model.favorites.count({
            where: {
                userId,
                objectType: ENTITY_TYPE_SITE,
            },
        });

        // 页面
        const pageFavoriteCount = await this.model.favorites.count({
            where: {
                userId,
                objectType: ENTITY_TYPE_PAGE,
            },
        });

        // 返回统计信息
        return {
            followsCount,
            followingCount,
            siteFavoriteCount,
            pageFavoriteCount,
        };
    };

    app.model.favorites = model;

    model.associate = () => {
        app.model.favorites.belongsTo(app.model.projects, {
            as: 'projects',
            foreignKey: 'objectId',
            targetKey: 'id',
            constraints: false,
        });
    };
    return model;
};
