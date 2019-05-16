
const { app, mock, assert  } = require('egg-mock/bootstrap');

describe("/indexs", () => {
	it("sum", ()=> {
		assert.equal(1+2, 3);
	});
});
