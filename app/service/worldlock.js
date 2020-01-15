'use strict';
const _ = require('lodash');
const moment = require('moment');
const Service = require('egg').Service;
const {
    REDIS_PREFIX_WORLDLOCK,
    PROJECT_TYPE_PARACRAFT,
    WORLDLOCK_LOCKTIME,
    WORLDLOCK_TIME_FORMAT,
} = require('../core/consts');
const fastJson = require('fast-json-stringify');
const worldlockEntity = require('../validator/worldlock/entity');
const worldlockStringify = fastJson(worldlockEntity);

class WorldLock extends Service {
    getModeLockTime(mode) {
        // 默认锁时间为心跳时间的三倍
        const locktime = WORLDLOCK_LOCKTIME[mode] || 0;
        return locktime * 3 * 1000; // eslint-disable-line
    }

    getWorldlockKey(pid) {
        return REDIS_PREFIX_WORLDLOCK + pid;
    }

    calculateLockTime(mode) {
        const lastLockTime = moment().format(WORLDLOCK_TIME_FORMAT);
        const maxLockTime = moment(
            Date.now() + this.getModeLockTime(mode)
        ).format(WORLDLOCK_TIME_FORMAT);
        return {
            lastLockTime,
            maxLockTime,
        };
    }

    updateWorldlockData(worldlock, payload) {
        return _.merge(
            worldlock,
            _.pick(payload, [ 'revision', 'server', 'password' ]),
            this.calculateLockTime(payload.mode)
        );
    }

    buildWorldlockData(user, payload) {
        const worldlock = _.pick(payload, [
            'pid',
            'mode',
            'revision',
            'server',
            'password',
        ]);
        worldlock.owner = _.pick(user, [ 'userId', 'username' ]);
        return _.merge(worldlock, this.calculateLockTime(payload.mode));
    }

    async saveLockDataToRedis(key, worldlock) {
        return this.app.redis.set(
            key,
            worldlockStringify(worldlock),
            'EX',
            this.getModeLockTime(worldlock.mode)
        );
    }

    async getLockDataFromRedis(key) {
        const data = await this.app.redis.get(key);
        if (data) return JSON.parse(data);
    }

    async upsertWorldlock(user, payload) {
        const { ctx, app } = this;
        const { pid } = payload;
        const key = this.getWorldlockKey(pid);
        let worldlock = await this.getLockDataFromRedis(key);

        if (worldlock && worldlock.owner.userId === user.userId) {
            if (worldlock.mode !== payload.mode) {
                return ctx.throw('Invalid Mode', 400);
            }
            worldlock = this.updateWorldlockData(worldlock, payload);
            await this.saveLockDataToRedis(key, worldlock);
            return worldlock;
        }

        const project = await app.model.Project.findOne({
            where: { id: pid },
        });
        if (!project) return ctx.throw('Invalid pid', 404);
        const canWrite = await project.canWriteByUser(user.userId);
        if (!canWrite) return ctx.throw('Permission denied', 403);
        if (project.type !== PROJECT_TYPE_PARACRAFT) {
            return ctx.throw('Not a world project', 400);
        }

        if (!worldlock) {
            // create new worldlock and become lock owner
            worldlock = this.buildWorldlockData(user, payload);
            await this.saveLockDataToRedis(key, worldlock);
        }

        return worldlock;
    }

    async deleteWorldlock(user, pid) {
        const key = this.getWorldlockKey(pid);
        const worldlock = await this.getLockDataFromRedis(key);
        if (worldlock) {
            if (worldlock.owner.userId === user.userId) {
                return await this.app.redis.del(key);
            }
            return this.ctx.throw('Invalid User', 400);
        }
        return this.ctx.throw('Invalid pid', 404);
    }
}

module.exports = WorldLock;
