'use strict';

const _ = require('lodash');
const DataLoader = require('dataloader');

class Model {
  constructor(app) {
    this.app = app;

    this.promises = [];

    this.projectLoader = new DataLoader(async ids => {
      const list = await app.model.projects.findAll({ where: { id: { $in: ids } } }).then(list => list.map(o => o.toJSON()));
      return _.map(ids, id => _.find(list, o => o.id === id));
    });

    this.userLoader = new DataLoader(async ids => {
      const list = await app.model.users.findAll({ where: { id: { $in: ids } } }).then(list => list.map(o => o.toJSON()));
      return _.map(ids, id => _.find(list, o => o.id === id));
    });

    this.userinfoLoader = new DataLoader(async ids => {
      const list = await app.model.userinfos.findAll({ where: { id: { $in: ids } } }).then(list => list.map(o => o.toJSON()));
      return _.map(ids, id => _.find(list, o => o.id === id));
    });
  }

  promise(func) {
    this.promises.push(new Promise(async (resolve, reject) => {
      await func().catch(e => reject(e));
      resolve(true);
    }));
  }

  async promiseAll() {
    Promise.all(this.promises);
    this.promises = [];
    return;
  }

  async promiseRace() {
    Promise.race(this.promises);
    this.promises = [];
    return;
  }
}

module.exports = Model;
