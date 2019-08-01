const _ = require("lodash");
const axios = require("axios");
const Subscription = require('egg').Subscription;

class Test extends Subscription {
	static get schedule() {
		return {
			cron: "0 0 1 1 * *", // 每个月1号凌晨1点更新IP数据
			type:"worker",
			//immediate: true,
		}
	}

	async subscribe(ctx) {
		const ipstr = await axios.get("http://ftp.apnic.net/apnic/stats/apnic/delegated-apnic-latest").then(res => res.data);
		await this.app.model.ips.truncate({restartIdentity: true, cascade: true});

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
				await this.app.model.ips.bulkCreate(ipdatas);
				ipdatas = [];
			}
		}

		if (ipdatas.length) {
			await this.app.model.ips.bulkCreate(ipdatas);
		}
	}
}

module.exports = Test;
