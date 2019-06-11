'use strict';

const { app, assert } = require('egg-mock/bootstrap');

let factory;
before(() => {
  factory = app.factory;
});

beforeEach(() => {
  app.mockService('user', 'validateToken', app.mock.service.common.ok);
});

describe('test/controller/project.test.js', () => {
  describe('get projects', () => {
    it('should get /projects', async () => {
      const num = 5;
      const user = await factory.create('User');
      await factory.createMany('Project', num, { userId: user.id });
      const token = app.mock.utils.token(user);

      const res = await app.httpRequest()
        .get('/projects')
        .set('Accept', 'application/json')
        .set('Authorization', token)
        .expect(200);

      const projects = res.body;
      assert(projects.length === num);
    });
  });

  describe('get single project', () => {
    it('should get /project/:id', async () => {
      const project = await factory.create('Project');
      const id = project.id;
      const user = await project.getUsers();
      const token = app.mock.utils.token(user);

      const res = await app.httpRequest()
        .get(`/projects/${id}`)
        .set('Accept', 'application/json')
        .set('Authorization', token)
        .expect(200);

      assert(id === res.body.id);
    });
  });

  describe('create projects', () => {
    it('should post /projects', async () => {
      const project = await factory.build('Project');
      const user = await project.getUsers();
      const token = app.mock.utils.token(user);

      app.mockService('world', 'generateDefaultWorld', app.mock.service.common.ok);
      return app.httpRequest()
        .post('/projects')
        .send(project.dataValues)
        .set('Accept', 'application/json')
        .set('Authorization', token)
        .expect(200);
    });
  });

  describe('delete site based projects', () => {
    it('should delete /projects/:id', async () => {
      const project = await factory.create('Project', {
        type: 1,
      });
      const user = await project.getUsers();
      const token = app.mock.utils.token(user);

      app.mockService('world', 'removeProject', app.mock.service.common.ok);
      return app.httpRequest()
        .delete(`/projects/${project.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', token)
        .expect(200);
    });
  });

  describe('delete paracraft based projects', () => {
    it('should delete /projects/:id', async () => {
      const project = await factory.create('Project');
      const user = await project.getUsers();
      await factory.create('World', { userId: project.userId, projectId: project.id });
      const token = app.mock.utils.token(user);

      app.mockService('world', 'removeProject', app.mock.service.common.ok);
      return app.httpRequest()
        .delete(`/projects/${project.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', token)
        .expect(200);
    });
  });
});
