const { app, assert } = require('egg-mock/bootstrap');

describe('test/controller/tag.test.js', () => {
	describe('#GET /tags/packages', async () => {
		beforeEach(async () => {
			await app.model.systemTags.create({ tagname: 'whatever' });
		});
		it('001', async () => {
			const ret = await app
				.httpRequest()
				.get('/api/v0/tags/packages?id=1')
				.expect(200)
				.then(r => r.body);

			assert(ret.id && ret.tagname === 'whatever');
		});
		it('002', async () => {
			const ret = await app
				.httpRequest()
				.get('/api/v0/tags/packages?id=2')
				.expect(200)
				.then(r => r.body);
			assert(!ret.id);
		});
	});
});
