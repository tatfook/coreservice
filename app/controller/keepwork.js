
const _ = require("lodash");
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
}

module.exports = Keepwork;
