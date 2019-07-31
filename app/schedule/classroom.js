
const moment = require("moment");
const parser = require("cron-parser");

const Subscription = require('egg').Subscription;

class Classroom extends Subscription {
	static get schedule() {
		return {
			cron:"0 0 2 */1 * *",
			type:"worker",
			//disable:true,
			//immediate: true,
		}
	}

	async subscribe(ctx) {
		const sql = `update classrooms set state = 2 WHERE state = 1 and DATE_SUB(NOW(), INTERVAL 2 DAY) > createdAt and id > 0`;
		return await this.app.lessonModel.query(sql, {
			type: this.app.lessonModel.QueryTypes.UPDATE,
		});
	}
}

module.exports = Classroom;
