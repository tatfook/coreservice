'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/service/worldlock.test.js', () => {
    let ctx;
    let project;
    let payload;
    let user;
    let userData;
    beforeEach(async () => {
        ctx = app.mockContext();
        user = await app.factory.create('users');
        project = await app.factory.create('projects', {}, { user });
        userData = {
            userId: user.id,
            username: user.username,
        };
        payload = {
            pid: project.id,
            mode: 'share',
            revision: 1,
            server: 'username@t1.tunnel.keepwork.com',
            password: '123456',
        };
    });

    describe('#upsertWorldlock', () => {
        it('should create new lock with owner', async () => {
            const worldlock = await ctx.service.worldlock.upsertWorldlock(
                userData,
                payload
            );
            assert(worldlock);
            const key = ctx.service.worldlock.getWorldlockKey(project.id);
            const res = await ctx.service.worldlock.getLockDataFromRedis(key);
            assert(res && res.pid === project.id);
        });

        it('should create new lock with member', async () => {
            const user2 = await app.factory.create('users');
            await app.factory.create('members', {}, { user: user2 });
            userData.userId = user2.id;
            const worldlock = await ctx.service.worldlock.upsertWorldlock(
                userData,
                payload
            );
            assert(worldlock);
            const key = ctx.service.worldlock.getWorldlockKey(project.id);
            const res = await ctx.service.worldlock.getLockDataFromRedis(key);
            assert(res && res.pid === project.id);
        });

        it('should update lock data with owner', async () => {
            await ctx.service.worldlock.upsertWorldlock(userData, payload);
            payload.revision = 66;
            const worldlock = await ctx.service.worldlock.upsertWorldlock(
                userData,
                payload
            );
            assert(worldlock && worldlock.revision === payload.revision);
            const key = ctx.service.worldlock.getWorldlockKey(project.id);
            const res = await ctx.service.worldlock.getLockDataFromRedis(key);
            assert(
                res &&
                    res.pid === project.id &&
                    res.revision === payload.revision
            );
        });

        it('should return lock data with member', async () => {
            await ctx.service.worldlock.upsertWorldlock(userData, payload);
            payload.revision = 99;
            const user2 = await app.factory.create('users');
            await app.factory.create('members', {}, { user: user2 });
            userData.userId = user2.id;
            const worldlock = await ctx.service.worldlock.upsertWorldlock(
                userData,
                payload
            );
            assert(
                worldlock &&
                    worldlock.revision !== payload.revision &&
                    worldlock.owner.userId !== user2.id
            );
            const key = ctx.service.worldlock.getWorldlockKey(project.id);
            const res = await ctx.service.worldlock.getLockDataFromRedis(key);
            assert(
                res &&
                    res.pid === project.id &&
                    res.revision !== payload.revision &&
                    res.owner.userId !== user2.id
            );
        });

        it('should raise error with stranger', async () => {
            await ctx.service.worldlock.upsertWorldlock(userData, payload);
            payload.revision = 99;
            const user2 = await app.factory.create('users');
            userData.userId = user2.id;
            const errorMessage = 'should failed with stranger';
            try {
                await ctx.service.worldlock.upsertWorldlock(userData, payload);
                ctx.throw(errorMessage);
            } catch (e) {
                assert(e.message !== errorMessage);
            }
        });

        it('should raise error with invalid pid', async () => {
            await ctx.service.worldlock.upsertWorldlock(userData, payload);
            payload.revision = 99;
            payload.pid = payload.pid + 1;
            const errorMessage = 'should failed with invalid pid';
            try {
                await ctx.service.worldlock.upsertWorldlock(userData, payload);
                ctx.throw(errorMessage);
            } catch (e) {
                assert(e.message !== errorMessage);
            }
        });
    });

    describe('#deleteWorldlock', () => {
        it('should deleted by lock owner', async () => {
            await ctx.service.worldlock.upsertWorldlock(userData, payload);
            const result = await ctx.service.worldlock.deleteWorldlock(
                userData,
                payload.pid
            );
            assert(result);
        });

        it('should failed with project member', async () => {
            await ctx.service.worldlock.upsertWorldlock(userData, payload);
            const user2 = await app.factory.create('users');
            await app.factory.create('members', {}, { user: user2 });
            userData.userId = user2.id;
            const errorMessage = 'should failed';
            try {
                await ctx.service.worldlock.deleteWorldlock(
                    userData,
                    payload.pid
                );
                ctx.throw(errorMessage);
            } catch (e) {
                assert(e.message !== errorMessage);
            }
        });

        it('should failed with stranger', async () => {
            await ctx.service.worldlock.upsertWorldlock(userData, payload);
            const user2 = await app.factory.create('users');
            userData.userId = user2.id;
            const errorMessage = 'should failed';
            try {
                await ctx.service.worldlock.deleteWorldlock(
                    userData,
                    payload.pid
                );
                ctx.throw(errorMessage);
            } catch (e) {
                assert(e.message !== errorMessage);
            }
        });

        it('should failed with invalid pid', async () => {
            await ctx.service.worldlock.upsertWorldlock(userData, payload);
            payload.pid = payload.pid + 1;
            const errorMessage = 'should failed';
            try {
                await ctx.service.worldlock.deleteWorldlock(
                    userData,
                    payload.pid
                );
                ctx.throw(errorMessage);
            } catch (e) {
                assert(e.message !== errorMessage);
            }
        });
    });
    describe('#getModeLockTime', () => {
        it('should return three times of mode lock time', () => {
            const locktime = ctx.service.worldlock.getModeLockTime('share');
            assert(locktime === 3 * 30 * 1000);
            const locktime2 = ctx.service.worldlock.getModeLockTime(
                'exclusive'
            );
            assert(locktime2 === 3 * 120 * 1000);
        });
        it('should return 0 if mode is invalid', () => {
            const locktime = ctx.service.worldlock.getModeLockTime(
                'wttttttttttttttttt'
            );
            assert(locktime === 0);
        });
    });
});
