
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const Game = class extends Controller {
	get modelName() {
		return "games";
	}

	async members(){
		//this.adminAuthenticated();
		const {gameName, gameNo, name, cellphone} = this.validate();
		const {limit, offset} = this.ctx.state.queryOptions;
		let filterStr = '';

		if (gameName) filterStr += " and games.name = :gameName";
		if (gameNo) filterStr += " and games.no = :gameNo";
		if (name) filterStr += " and userinfos.name = :name";
		if (cellphone) filterStr += " and users.cellphone = :cellphone";
		
		const countsql = `select count(*) as count from games, users, gameWorks, userinfos 
		where gameWorks.userId = users.id and gameWorks.gameId = games.id and gameWorks.userId = userinfos.userId ${filterStr}
		group by gameWorks.userId`;
		const totals = await this.model.query(countsql, {
			type: this.model.QueryTypes.SELECT,
			replacements: {gameName, gameNo, name, cellphone},
		});
		const total = totals[0] ? totals[0]["count"] : 0;

		const sql = `select games.name as gameName, games.no as gameNo, userinfos.name as name, count(gameWorks.userId) as worksCount, users.sex as sex, 
		userinfos.birthdate as birthdate, users.cellphone as cellphone, users.email as email, userinfos.qq as qq, userinfos.school as school 
		from games, users, gameWorks, userinfos 
		where gameWorks.userId = users.id and gameWorks.gameId = games.id and gameWorks.userId = userinfos.userId ${filterStr}
		group by gameWorks.userId limit :limit offset :offset`;

		const list = await this.model.query(sql, {
			type: this.model.QueryTypes.SELECT,
			replacements: {gameName, gameNo, name, cellphone, limit, offset},
		});

		return this.success({total, rows: list});
	}

	async projects() {
		const {userId} = this.authenticated();
		const sql = `select * from projects where userId = :userId and id not in (select projectId from gameWorks);`;
		const list = await this.model.query(sql, {
			type: this.model.QueryTypes.SELECT,
			replacements: {userId},
		});

		return this.success(list);
	}
}

module.exports = Game;
