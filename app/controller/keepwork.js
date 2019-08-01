
const fs = require("fs");
const _ = require("lodash");
const moment = require("moment");
const axios = require("axios");
const uuidv1 = require('uuid/v1');
const svgCaptcha = require('svg-captcha');

const Controller = require("../core/controller.js");

const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_PROJECT,

	PROJECT_PRIVILEGE_RECRUIT_ENABLE,
	PROJECT_PRIVILEGE_RECRUIT_DISABLE,

	PROJECT_TYPE_PARACRAFT,
	PROJECT_TYPE_SITE
} = require("../core/consts.js");

class Keepwork extends Controller {
	async email() {
		const  {html, to, from, subject} = this.validate({
			html: "string",
			to: "string",
			subject: "string",
		});

		const ok = await this.ctx.service.email.send({html, to, from, subject});

		return this.success(ok);
	}

	// 获取 svg 验证码
	async getSvgCaptcha() {
		const captcha = svgCaptcha.createMathExpr({
			mathMin: 1,
			mathMax: 9,
			mathOperator: "+",
		});
		//const captcha = svgCaptcha.create({});

		const key = "svg-captcha-" + uuidv1();

		await this.model.caches.set(key, captcha.text, 1000 * 60 * 10); // 有效期十分钟

		//console.log(captcha);

		return this.success({key, captcha: captcha.data});
	}

	// 验证 svg 验证码
	async postSvgCaptcha() {
		const {key, captcha} = this.validate({key:"string", captcha:"string"});

		const value = await this.model.caches.get(key);

		if (value && captcha && value == captcha) return this.success(true);

		return this.success(false);
	}

	// 增加页面访问量
	async postPageVisit() {
		const ip = this.ctx.ip;
		const {url} = this.validate({url:"string"});
		const ipsetkey = `${url}-page-visit-ip-sets`;
		const ret = await this.app.redis.sadd(ipsetkey, ip);

		const timestamp = moment(moment(new Date()).format("YYYY-MM-DD")).add(1, "days").unix();
		await this.app.redis.expireat(ipsetkey, timestamp);

		this.success(await this.app.redis.scard(ipsetkey));
	}

	// 或取页面访问量
	async getPageVisit() {
		const {url} = this.validate({url:"string"});
		const ipsetkey = `${url}-page-visit-ip-sets`;
		this.success(await this.app.redis.scard(ipsetkey));
	}

	async statistics() {
		const {app} = this;

		const paracraftCount = await app.model.projects.count({where:{type:PROJECT_TYPE_PARACRAFT}});
		const siteCount = await app.model.projects.count({where:{type:PROJECT_TYPE_SITE}});
		const projectCount = paracraftCount + siteCount;

		const sql = `select count(*) count from projects where privilege & :recuritValue`;
		const list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				recuritValue: PROJECT_PRIVILEGE_RECRUIT_ENABLE,
			}
		});
		const recuritCount = list[0] ? list[0].count : 0;
		const userCount = await app.model.users.count({});

		const data = {paracraftCount, siteCount, recuritCount, userCount, projectCount}

		return this.success(data);
	}

	async words() {
		const self = this;

		const wordstr = await new Promise((resolve, reject) => {
			fs.readFile("./app/controller/sensitive_word.txt", function(err, data) {
				if (err) {
					console.log("加载铭感词文件失败");
					return resolve("");
				}

				return resolve(data.toString());
			});

		});
		
		const words = wordstr.split(",");
		for (let i = 0; i < words.length; i++) {
			const word = words[i];
			await this.model.sensitiveWords.upsert({word});
		}

		//_.each(words, async (word) => await this.model.sensitiveWords.upsert({word}));
		
		return this.success({words, size: words.length});
	}

	async ip() {
		const ipstr = await axios.get("http://ftp.apnic.net/apnic/stats/apnic/delegated-apnic-latest").then(res => res.data);
		// http://ftp.apnic.net/apnic/stats/apnic/delegated-apnic-latest
		await this.model.ips.truncate({restartIdentity: true, cascade: true});

		//const ipstr = await new Promise((resolve, reject) => {
			//fs.readFile("ip", function(err, data) {
				//if (err) {
					//console.log("加载铭感词文件失败");
					//return resolve("");
				//}

				//return resolve(data.toString());
			//});
		//});

		const ips = ipstr.split("\n").filter(o => o.indexOf("apnic|CN|ipv") == 0);
		let ipdatas = [] ;
		for (let i = 0; i < ips.length; i++) {
			const _ips = ips[i].split("|");
			const cc = _ips[1];
			const type = _ips[2];
			const ip = _ips[3];
			const value = _ips[4];

			if (type == "ipv4") {
				const ipns = ip.split(".");
				const ipn1 = _.toNumber(ipns[0]) * 256 * 256 * 256;
				const ipn2 = _.toNumber(ipns[1]) * 256 * 256;
				const ipn3 = _.toNumber(ipns[2]) * 256;
				const ipn4 = _.toNumber(ipns[3]);
				const count = _.toNumber(value);
				const start = ipn1 + ipn2 + ipn3 + ipn4;
				const end = start + count;
				ipdatas.push({ip, start, end, cc, type});
			} else if (type == "ipv6") {

			}
			if (ipdatas.length == 1000) {
				await this.model.ips.bulkCreate(ipdatas);
				ipdatas = [];
			}
		}

		if (ipdatas.length) {
			await this.model.ips.bulkCreate(ipdatas);
		}

		return this.success(ips);
	}
}

module.exports = Keepwork;
