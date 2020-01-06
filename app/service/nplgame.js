'use strict';

// const Service = require('egg').Service;
const Service = require('../core/service.js');

class NplGame extends Service {
    async getGames(query = {}) {
        return await this.app.model.games.findAndCountAll({ where: query });
    }

    async getGameWorks(query) {
        return await this.app.model.gameWorks.findAll({ where: query });
    }

    async getGameMembers({ gameId, gameName, gameNo, name, cellphone }) {
        let filterStr = '';
        if (gameId) filterStr += ' and games.id = :gameId';
        if (gameName) filterStr += ' and games.name = :gameName';
        if (gameNo) filterStr += ' and games.no = :gameNo';
        if (name) filterStr += ' and userinfos.name = :name';
        if (cellphone) filterStr += ' and users.cellphone = :cellphone';

        const sql = `select games.name as gameName, games.no as gameNo, userinfos.name as name, count(gameWorks.userId) as worksCount, users.sex as sex, 
		userinfos.birthdate as birthdate, users.cellphone as cellphone, users.email as email, userinfos.qq as qq, userinfos.school as school 
		from games, users, gameWorks, userinfos 
		where gameWorks.userId = users.id and gameWorks.gameId = games.id and gameWorks.userId = userinfos.userId ${filterStr}
		group by gameWorks.userId limit 10000 offset 0`;

        const list = await this.model.query(sql, {
            type: this.model.QueryTypes.SELECT,
            replacements: { gameName, gameNo, name, cellphone, gameId },
        });

        return list;
    }
}

module.exports = NplGame;
