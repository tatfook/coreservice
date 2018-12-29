
const _ = require("lodash");
const Controller = require("../core/controller.js");


class Index extends Controller {
	async index() {
		const rsaConfig = this.config.self.rsa;
		const sig = this.util.rsaEncrypt(rsaConfig.privateKey, "hello world");
		const content = this.util.rsaDecrypt(rsaConfig.publicKey, sig);
		console.log(sig, content);
		this.ctx.status = 200;
		this.ctx.body = "hello world";
	}

	async test() {
		const uuid_short = this.model.fn("uuid_short");
		console.log(uuid_short, typeof(uuid_short));

		//console.log("uuid_short:", uuid_short());
		return this.success();
	}
}

module.exports = Index;
