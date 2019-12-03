'use strict';
const Controller = require('../core/controller.js');

const PBlock = class extends Controller {
    get modelName() {
        return 'pBlocks';
    }

    async index() {
        const userId = this.ctx.state.user.userId || 0;

        const list = await this.model.pBlocks.findAll({ where: { userId } });

        return this.success(list);
    }

    async system() {
        const { pClassifyId, keyword } = this.validate({
            pClassifyId: 'number_optional',
            keyword: 'string_optional',
        });
        const { userId } = this.getUser();
        const whereConditions = [];
        const $gt = this.model.Op.gt;
        whereConditions.push({
            commonUser: {
                [$gt]: 0,
            },
        });
        let user = {};
        if (userId) {
            user =
                (await this.model.users.findOne({
                    where: {
                        id: userId,
                    },
                })) || {};
            if (user.vip) {
                whereConditions.push({
                    vip: {
                        [$gt]: 0,
                    },
                });
            }
            if (user.tLevel) {
                whereConditions.push({
                    [`t${user.tLevel}`]: {
                        [$gt]: 0,
                    },
                });
            }
        }
        const query = {
            userId: 0,
        };
        if (keyword) {
            query[this.model.Op.or] = [
                {
                    id: { [this.model.Op.like]: `%${keyword}%` },
                },
                {
                    name: { [this.model.Op.like]: `%${keyword}%` },
                },
            ];
        }
        const pClassifyWhere = {};
        const include = [
            {
                model: this.model.pBlockAccesses,
                as: 'pBlockAccesses',
                where: {
                    [this.model.Op.or]: whereConditions,
                },
            },
        ];
        if (pClassifyId) {
            pClassifyWhere.classifyId = pClassifyId;
            include.push({
                model: this.model.pBlockClassifies,
                as: 'pBlockClassifies',
                attributes: [],
                where: pClassifyWhere,
            });
        }
        const list = await this.model.pBlocks.findAndCountAll({
            where: query,
            include,
            ...this.queryOptions,
            distinct: true,
        });
        list.rows = list.rows.map(item => {
            item = item.toJSON();
            const canUse =
                item.pBlockAccesses.commonUser > 1 ||
                (user.vip && item.pBlockAccesses.vip > 1) ||
                (user.tLevel && item.pBlockAccesses[`t${user.tLevel}`] > 1);
            item.canUse = !!canUse;
            delete item.pBlockAccesses;
            return item;
        });
        return this.success(list);
    }

    async systemClassifies() {
        const { userId } = this.getUser();
        const whereConditions = [];
        whereConditions.push({
            commonUser: 1,
        });
        if (userId) {
            const user =
                (await this.model.users.findOne({
                    where: {
                        id: userId,
                    },
                })) || {};
            if (user.vip) {
                whereConditions.push({
                    vip: 1,
                });
            }
            if (user.tLevel) {
                whereConditions.push({
                    [`t${user.tLevel}`]: 1,
                });
            }
        }

        const list = await this.model.pClassifies.findAll({
            include: [
                {
                    model: this.model.pClassifyAccesses,
                    as: 'pClassifyAccesses',
                    attributes: [],
                    where: {
                        [this.model.Op.or]: whereConditions,
                    },
                },
            ],
        });

        return this.success(list);
    }

    async use() {
        const { id } = this.validate({ id: 'number' });

        await this.model.pBlocks.increment(
            {
                useCount: 1,
            },
            {
                where: { id },
            }
        );

        return this.success();
    }

    async destroy() {
        const { userId } = this.authenticated();
        const { id } = this.validate({ id: 'number' });
        const config = this.app.config.self;

        const block = await this.model.pBlocks
            .findOne({ where: { id, userId } })
            .then(o => o && o.toJSON());
        if (!block) return this.success();

        const bucketDomain = config.qiniuPublic.bucketDomain;
        const bucket = config.qiniuPublic.bucketName;

        if (block.previewUrl) {
            const key = block.previewUrl.replace(bucketDomain + '/', '');
            await this.ctx.service.qiniu.delete({ key, bucket });
        }

        if (block.fileUrl) {
            const key = block.fileUrl.replace(bucketDomain + '/', '');
            await this.ctx.service.qiniu.delete({ key, bucket });
        }

        await this.model.pBlocks.destroy({ where: { id, userId } });

        return this.success();
    }
};

module.exports = PBlock;
