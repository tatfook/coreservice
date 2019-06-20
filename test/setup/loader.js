
const md5 = require("blueimp-md5");
const { app, mock, assert  } = require('egg-mock/bootstrap');
const loadFactory = require("./factory.js");


module.exports = app => {
	app.mock = app.mock || {};

	app.login = async (user = {}) => {
		user.password = md5("123456");
		user = await app.factory.create("users", user).then(o => o.toJSON());
		return await app.httpRequest().post(`/api/v0/users/login`).send({
			username: user.username, 
			password: "123456",
		}).expect(res => assert(res.statusCode == 200)).then(res => res.body);
	}

	loadFactory(app);
}
