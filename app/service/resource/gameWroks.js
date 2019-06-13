'use strict';

const _ = require('lodash');
const Model = require('./model.js');

class GameWorks extends Model {
  async buildList(list) {
    const promises = [];
    _.each(list, o => {
      promises.push(this.projectLoader.load(o.projectId).then(project => { o.project = project; }));
      promises.push(this.userLoader.load(o.userId).then(user => { o.user = user; }));
      promises.push(this.userinfoLoader.load(o.userId).then(userinfo => { o.userinfo = userinfo; }));
    });

    return await Promise.all(promises);
  }

  async build(data) {
    if (data.projectId) {
      const project = await this.projectLoader.load(data.projectId);
      data.userId = project.userId;
    }

    if (data.reward !== undefined) data.win = data.reward ? 1 : 0;

    return data;
  }

  // async afterCreate() {

  // }

  // async afterUpdate() {

  // }

  // async afterDelete() {

  // }
}

module.exports = GameWorks;
