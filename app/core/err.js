
const errs = {};
class Err {
	constructor(code, message, data) {
		this.code = code;
		this.message = message;
		this.data = data;

		errs[code] = this;
	}

	static getByCode(code) {
		return errs[code];
	}
}

new Err(-1, "未知错误");
new Err(0, "服务器繁忙,请稍后重试...");
new Err(1, "用户名或密码错误");
new Err(2, "用户名不合法");
new Err(3, "用户已存在");
new Err(4, "验证码过期");
new Err(5, "验证码错误");
new Err(6, "创建git用户失败");

module.exports = Err;
