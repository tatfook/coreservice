'use strict';
const Service = require('../core/service.js');

// sms.send("18702759796", ["2461", "3分钟"]);

class Lesson extends Service {
    async getUserById(userId) {
        const user = await this.model.users.findOne({
            where: { id: userId },
            attributes: {
                exclude: [ 'password' ],
            },
        });
        return user && user.get({ plain: true });
    }

    async updateUserById(userId, params) {
        const result = await this.model.users.update(params, {
            where: {
                id: userId,
            },
        });
        return (result && result[0] === 1);
    }
}

module.exports = Lesson;
