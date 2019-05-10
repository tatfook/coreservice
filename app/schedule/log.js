
const moment = require("moment");

const Subscription = require('egg').Subscription;

class Log extends Subscription {
	static get schedule() {
		return {
			cron:"0 0 2 */3 * *",
			type:"worker",
			//disable:true,
			immediate: true,
		}
	}

	async subscribe() {
		// 保留3天的日志量
		const sql = `delete from logs where DATE_SUB(NOW(), INTERVAL 3 DAY) > createdAt and id > 0`;

		return await this.app.model.query(sql, {
			type: this.app.model.QueryTypes.DELETE,
		});
	}
}

module.exports = Log;
