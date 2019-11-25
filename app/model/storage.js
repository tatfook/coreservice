/* eslint-disable no-magic-numbers */
'use strict';
module.exports = app => {
    const { BIGINT, INTEGER } = app.Sequelize;
    // del???
    const model = app.model.define(
        'storages',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            userId: {
                // 文件所属者
                type: BIGINT,
                unique: true,
                allowNull: false,
            },

            total: {
                type: BIGINT,
                defaultValue: 2 * 1024 * 1024 * 1024,
            },

            used: {
                type: BIGINT,
                defaultValue: 0,
            },

            fileCount: {
                type: INTEGER,
                defaultValue: 0,
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
        }
    );

    model.updateStatistics = async function(userId) {
        const sql =
            'SELECT SUM(size) AS `used`, COUNT(*) as `fileCount` from `files` where `userId` = :userId and size > 0';
        const result = await app.model.query(sql, {
            type: app.model.QueryTypes.SELECT,
            replacements: {
                userId,
            },
        });

        if (!result || !result[0]) return;
        const data = result[0];

        await app.model.storages.update(
            {
                userId,
                used: data.used,
                fileCount: data.fileCount,
            },
            {
                where: {
                    userId,
                },
            }
        );

        return;
    };

    model.getStatistics = async function(userId) {
        await this.updateStatistics(userId);

        let data = await app.model.storages.findOne({ where: { userId } });

        if (!data) {
            data = {
                userId,
                total: 2 * 1024 * 1024 * 1024,
                used: 0,
                fileCount: 0,
            };
            await app.model.storages.create(data);
        }

        return data;
    };

    model.isFull = async function(userId) {
        const data = await this.getStatistics(userId);

        if (data.used < data.total) {
            return false;
        }

        return true;
    };

    app.model.storages = model;
    return model;
};
