
const { app, mock, assert  } = require('egg-mock/bootstrap');
const initData = require("../data.js");

describe("oauth user", () => {
	before(async ()=>{
		await initData(app);
	});

	it("github oauth", async ()=> {
	});
});
