const { app, assert } = require('egg-mock/bootstrap');

describe('test/controller/pBlock.test.js', () => {
    describe('# GET /pBlocks/systemClassifies', () => {
        it('## without user token', async () => {
            await app.model.pClassifies.create({
                name: 'test',
            });
            await app.model.pClassifyAccesses.create({
                pClassifyId: 1,
                commonUser: 1,
            });
            const result = await app
                .httpRequest()
                .get('/api/v0/pBlocks/systemClassifies')
                .expect(200)
                .then(res => res.body);
            assert(result.length === 1);
        });

        it('## without user token cannot see unauth classify', async () => {
            await app.model.pClassifies.create({
                name: 'test',
            });
            await app.model.pClassifyAccesses.create({
                pClassifyId: 1,
                commonUser: 0,
                vip: 1,
            });
            const result = await app
                .httpRequest()
                .get('/api/v0/pBlocks/systemClassifies')
                .expect(200)
                .then(res => res.body);
            assert(result.length === 0);
        });

        it('## with user token cannot see vip classify', async () => {
            await app.model.pClassifies.create({
                name: 'test',
            });
            await app.model.pClassifyAccesses.create({
                pClassifyId: 1,
                commonUser: 0,
                vip: 1,
            });
            const { token } = await app.login();
            const result = await app
                .httpRequest()
                .get('/api/v0/pBlocks/systemClassifies')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then(res => res.body);
            assert(result.length === 0);
        });

        it('## with user token can see vip classify', async () => {
            await app.model.pClassifies.create({
                name: 'test',
            });
            await app.model.pClassifyAccesses.create({
                pClassifyId: 1,
                commonUser: 0,
                vip: 1,
            });
            const user = await app.login({ vip: 1 });
            const result = await app
                .httpRequest()
                .get('/api/v0/pBlocks/systemClassifies')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => res.body);
            assert(result.length === 1);
        });

        it('## with user token can see t classify', async () => {
            await app.model.pClassifies.create({
                name: 'test',
            });
            await app.model.pClassifyAccesses.create({
                pClassifyId: 1,
                commonUser: 0,
                vip: 0,
                t1: 1,
            });
            const user = await app.login({ vip: 1, tLevel: 1 });
            const result = await app
                .httpRequest()
                .get('/api/v0/pBlocks/systemClassifies')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => res.body);
            assert(result.length === 1);
        });
    });

    describe('# GET /pBlocks/system', () => {
        it('## without user login get can see pBlock', async () => {
            await app.model.pBlocks.create({
                name: 'testBlock',
            });
            await app.model.pBlockAccesses.create({
                pBlockId: 1,
                commonUser: 2,
            });
            const result = await app
                .httpRequest()
                .get('/api/v0/pBlocks/system')
                .expect(200)
                .then(res => res.body);
            assert(result.rows && result.rows[0] && result.rows[0].canUse);
        });

        it('## without user login get can see pBlock but cannot use', async () => {
            await app.model.pBlocks.create({
                name: 'testBlock',
            });
            await app.model.pBlockAccesses.create({
                pBlockId: 1,
                commonUser: 1,
            });
            const result = await app
                .httpRequest()
                .get('/api/v0/pBlocks/system')
                .expect(200)
                .then(res => res.body);
            assert(
                result.rows && result.rows[0] && result.rows[0].canUse === false
            );
        });

        it('## vip user login get can use block', async () => {
            const user = await app.login({ vip: 1, tLevel: 1 });
            await app.model.pBlocks.create({
                name: 'testBlock',
            });
            await app.model.pBlockAccesses.create({
                pBlockId: 1,
                commonUser: 1,
                vip: 2,
            });
            const result = await app
                .httpRequest()
                .get('/api/v0/pBlocks/system')
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => res.body);
            assert(
                result.rows && result.rows[0] && result.rows[0].canUse === true
            );
        });

        it('## filter by classifyId', async () => {
            const user = await app.login({ vip: 1, tLevel: 1 });
            await app.model.pBlocks.create({
                name: 'testBlock',
            });
            await app.model.pBlockAccesses.create({
                pBlockId: 1,
                commonUser: 1,
                vip: 2,
            });
            await app.model.pClassifies.create({
                name: 'testClassify',
            });
            await app.model.pBlockClassifies.create({
                blockId: 1,
                classifyId: 1,
            });
            const result = await app
                .httpRequest()
                .get('/api/v0/pBlocks/system')
                .query({
                    pClassifyId: 1,
                })
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => res.body);
            assert(result.rows && result.rows[0]);

            const result2 = await app
                .httpRequest()
                .get('/api/v0/pBlocks/system')
                .query({
                    pClassifyId: 2,
                })
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => res.body);
            assert(result2.rows && !result2.rows[0]);
        });

        it('## filter by keyword', async () => {
            const user = await app.login({ vip: 1, tLevel: 1 });
            await app.model.pBlocks.create({
                name: 'testBlock',
            });
            await app.model.pBlockAccesses.create({
                pBlockId: 1,
                commonUser: 1,
                vip: 2,
            });
            await app.model.pClassifies.create({
                name: 'testClassify',
            });
            await app.model.pBlockClassifies.create({
                blockId: 1,
                classifyId: 1,
            });
            const result = await app
                .httpRequest()
                .get('/api/v0/pBlocks/system')
                .query({
                    keyword: 1,
                })
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => res.body);
            assert(result.rows && result.rows[0]);

            const result2 = await app
                .httpRequest()
                .get('/api/v0/pBlocks/system')
                .query({
                    keyword: 'test',
                })
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => res.body);
            assert(result2.rows && result2.rows[0]);

            const result3 = await app
                .httpRequest()
                .get('/api/v0/pBlocks/system')
                .query({
                    keyword: '2',
                })
                .set('Authorization', `Bearer ${user.token}`)
                .expect(200)
                .then(res => res.body);
            assert(result3.rows && !result3.rows[0]);
        });
    });
});
