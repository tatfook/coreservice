
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
		//const user = await this.model.users.findOne({where:{id:300}});
		//const account = await user.getAccount();
		//const accountUser = await account.getUser();
		////console.log(account, user);
		//const roles = await user.getRoles();
		//const role = roles[0];
		//const roleUser = await role.getUser();

		const illegals = await this.model.illegals.findAll({
			include: [
			{
				model: this.model.users,
				where: {
					username: "xiaoyao",
				}
			}
			]
		});
		return this.success(illegals);
	}
}

module.exports = Index;
