const fs = require('fs');
const moment = require('moment');
const { app, mock, assert } = require('egg-mock/bootstrap');

before(async () => {
    const user = await app.factory.create('users', {}).then(o => o.toJSON());
    console.log(user);
});

beforeEach(async () => {});

it('001', () => {});

it('002', () => {});

afterEach(async () => {});

after(async () => {});
