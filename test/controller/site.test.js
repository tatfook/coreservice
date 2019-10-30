const { app, mock, assert } = require('egg-mock/bootstrap');

describe('/api/v0/sites', () => {
    before(async () => {});

    it('001 网站增删查改 通过用户名站点名获取信息', async () => {
        const token = await app
            .login({ username: 'xiaoyao' })
            .then(o => o.token);
        assert.ok(token);

        // 创建网站
        const site1 = await app
            .httpRequest()
            .post('/api/v0/sites')
            .send({
                sitename: 'site1',
                description: 'test',
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(res => assert(res.statusCode == 200))
            .then(res => res.body);
        assert(site1);

        const site2 = await app
            .httpRequest()
            .post('/api/v0/sites')
            .send({
                sitename: 'site2',
                description: 'test',
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(res => assert(res.statusCode == 200))
            .then(res => res.body);
        assert(site2);

        // 获取网站列表
        let data = await app
            .httpRequest()
            .get('/api/v0/sites')
            .set('Authorization', `Bearer ${token}`)
            .expect(res => assert(res.statusCode == 200))
            .then(res => res.body);
        assert(data.length == 2);

        // 修改网站
        await app
            .httpRequest()
            .put('/api/v0/sites/' + site1.id)
            .set('Authorization', `Bearer ${token}`)
            .send({ description: 'description' })
            .expect(res => assert(res.statusCode == 200));

        // 获取指定网站
        data = await app
            .httpRequest()
            .get('/api/v0/sites/' + site1.id)
            .set('Authorization', `Bearer ${token}`)
            .expect(res => assert(res.statusCode == 200))
            .then(res => res.body);
        assert.equal(data.description, 'description');

        // 删除网站
        await app
            .httpRequest()
            .delete('/api/v0/sites/' + site2.id)
            .set('Authorization', `Bearer ${token}`)
            .expect(res => assert(res.statusCode == 200))
            .then(res => res.body);
        data = await app
            .httpRequest()
            .get('/api/v0/sites')
            .set('Authorization', `Bearer ${token}`)
            .expect(res => assert(res.statusCode == 200))
            .then(res => res.body);
        assert.equal(data.length, 1);

        data = await app
            .httpRequest()
            .get('/api/v0/sites/getByName?username=xiaoyao&sitename=site1')
            .set('Authorization', `Bearer ${token}`)
            .expect(res => assert(res.statusCode == 200))
            .then(res => res.body);
        assert(data.user.username == 'xiaoyao');
        assert(data.site.sitename == 'site1');
    });

    it('002 POST|PUT|DELETE|GET /site/:id/groups', async () => {
        const user = await app.login();
        const token = user.token;
        const userId = user.id;
        assert.ok(token);
        const group1 = await app.model.groups.create({
            userId,
            groupname: 'group1',
        });
        const group2 = await app.model.groups.create({
            userId,
            groupname: 'group2',
        });
        // 创建网站
        const site = await app
            .httpRequest()
            .post('/api/v0/sites')
            .send({
                sitename: 'site',
                description: 'test',
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(res => assert(res.statusCode == 200))
            .then(res => res.body);
        assert(site);
        const url = `/api/v0/sites/${site.id}/groups`;
        let data = await app
            .httpRequest()
            .post(url)
            .send({
                groupId: group1.id,
                level: 32,
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(res => assert(res.statusCode == 200))
            .then(res => res.body);
        assert.equal(data.id, 1);

        data = await app
            .httpRequest()
            .post(url)
            .send({
                groupId: group2.id,
                level: 64,
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(res => assert(res.statusCode == 200))
            .then(res => res.body);
        assert.equal(data.id, 2);

        data = await app
            .httpRequest()
            .get(url)
            .set('Authorization', `Bearer ${token}`)
            .expect(res => assert(res.statusCode == 200))
            .then(res => res.body);
        assert.equal(data.length, 2);

        await app
            .httpRequest()
            .put(url)
            .set('Authorization', `Bearer ${token}`)
            .send({ groupId: 1, level: 64 })
            .expect(res => assert(res.statusCode == 200));

        data = await app
            .httpRequest()
            .get(url)
            .set('Authorization', `Bearer ${token}`)
            .expect(res => assert(res.statusCode == 200))
            .then(res => res.body);
        assert.equal(data[0].level, 64);

        await app
            .httpRequest()
            .delete(url + '?groupId=2')
            .set('Authorization', `Bearer ${token}`)
            .expect(res => assert(res.statusCode == 200))
            .then(res => res.body);

        data = await app
            .httpRequest()
            .get(url)
            .set('Authorization', `Bearer ${token}`)
            .expect(res => assert(res.statusCode == 200))
            .then(res => res.body);
        assert.equal(data.length, 1);
    });

    it('003 GET /sites 获取参与站点', async () => {
        const user = await app.login();
        const token = user.token;
        const userId = await app.factory
            .create('users')
            .then(o => o.toJSON())
            .then(o => o.id);
        const site = await app.model.sites.create({
            userId,
            sitename: 'site2',
        });

        const group = await app.model.groups.create({
            userId,
            groupname: 'group2',
        });
        const groupMembers = await app.model.members.create({
            userId,
            objectType: 3,
            objectId: group.id,
            memberId: user.id,
        });
        const siteGroup = await app.model.siteGroups.create({
            userId,
            siteId: site.id,
            groupId: group.id,
            level: 64,
        });

        const sites = await app
            .httpRequest()
            .get('/api/v0/sites?owned=false&membership=true')
            .set('Authorization', `Bearer ${token}`)
            .expect(res => assert(res.statusCode == 200))
            .then(res => res.body);
        //console.log(sites);
        assert.equal(sites.length, 1);
        assert.equal(sites[0].sitename, 'site2');

        const level = await app
            .httpRequest()
            .get('/api/v0/sites/' + site.id + '/privilege')
            .set('Authorization', `Bearer ${token}`)
            .expect(res => assert(res.statusCode == 200))
            .then(res => res.body);
        assert.equal(level, 64);
    });
});
