
const axios = require("axios");
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");
const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_GROUP,

	USER_ACCESS_LEVEL_NONE,
	USER_ACCESS_LEVEL_READ,
	USER_ACCESS_LEVEL_WRITE,
} = require("../core/consts.js");

const Convert = class extends Controller {
	get modelName() {
	}

	async convert() {
		await this.users();
		await this.sites();
		await this.groups();
		await this.groupMembers();
		await this.siteGroups();

		return this.success("OK");
	}

	keepworkApiUrlPrefix() {
		return this.app.config.self.keepworkBaseURL;
	}

	convertUser(data) {
		let user = {
			id: data._id,
			username: data.username,
			password: data.password,
			nickname: data.displayName,
			sex: data.sex,
			description: data.introduce,
			portrait: data.portrait,
			email: data.email,
			cellphone: data.cellphone ? data.cellphone : null,
			realname: (data.realNameInfo && data.realNameInfo.cellphone) ? data.realNameInfo.cellphone : null,
			extra: {
				address: data.location,
			}
		};

		return user;
	}

	async userEmail() {
		const usersModel = this.ctx.model.users;

		let datas = await axios.get(this.keepworkApiUrlPrefix() + "user/export").then(res => res.data).catch(e => console.log(e));
		datas = _.uniqBy(datas, 'email');
		for (let i = 0; i < datas.length; i++) {
			let {_id, email} = datas[i];
			if (email && _id) {
				try {
					await usersModel.update({email}, {where:{id:_id}});
				} catch(e) {

				}
			}
		}

		return this.success("OK");
	}

	async users() {
		const usersModel = this.ctx.model.users;

		let datas = await axios.get(this.keepworkApiUrlPrefix() + "user/export").then(res => res.data).catch(e => console.log(e));
		datas = _.uniqBy(datas, 'username');
		datas = _.uniqBy(datas, '_id');
		const cellphone = {};

		let list = [];
		for (let i = 0; i < datas.length; i++) {
			let data = datas[i];
			if (data.cellphone) {
				if (cellphone[data.cellphone]) {
					data.cellphone = null;
				} else {
					cellphone[data.cellphone] = true;
				}
			}
			list.push(this.convertUser(data));

			if (list.length == 300) {
				await usersModel.bulkCreate(list);
				list = [];
			}
		}
		if (list.length > 0) {
			await usersModel.bulkCreate(list);
		}

		console.log(datas.length);
		return this.success(datas);
	}

	async convertSite(data) {
		const usersModel = this.ctx.model.users;
		let user = await usersModel.findOne({where:{username:data.username}});
		if (!user) return;
		let site = {
			id: data._id,
			userId: user.id,
			username: user.username,
			sitename: data.name,
			visibility: data.visibility == "public" ? 0 : 1,
			description: data.desc,
			extra: {
				logoUrl: data.logoUrl,
				displayName: data.displayName,
			}
		};

		return site;
	}

	async sites() {
		const sitesModel = this.ctx.model.sites;
		let datas = await axios.get(this.keepworkApiUrlPrefix() + "website/export").then(res => res.data);
		const compare = (s1, s2) => s1.username == s2.username && s1.sitename == s2.sitename;
		datas = _.uniqWith(datas, compare);
		let list = [];
		for (let i = 0; i < datas.length; i++) {
			let data = datas[i];
			const site = await this.convertSite(data);
			if (site) list.push(site);
			if (list.length == 300) {
				await sitesModel.bulkCreate(list);
				list = [];
			}
		}

		if (list.length > 0) {
			list = _.uniqWith(list, compare);
			await sitesModel.bulkCreate(list);
		}

		console.log(datas.length);

		return this.success(datas);
	}

	async convertGroup(data) {
		const usersModel = this.ctx.model.users;
		let user = await usersModel.findOne({where:{username:data.username}});
		if (!user) return;
		let group = {
			userId: user.id,
			id: data._id,
			groupname: data.groupname,
		};

		return group;
		//console.log("导入组", group);
		//return await groupsModel.create(group);
		//return await groupsModel.upsert(group);
	}

	async groups() {
		const groupsModel = this.ctx.model.groups;
		const compare = (s1, s2) => s1.userId == s2.userId && s1.groupname == s2.groupname;
		const datas = await axios.get(this.keepworkApiUrlPrefix() + "group/export").then(res => res.data);
		let list = [];
		for (let i = 0; i < datas.length; i++) {
			let data = datas[i];
			const group = await this.convertGroup(data);
			if (group) list.push(group);
			if (list.length == 300) {
				list = _.uniqWith(list, compare);
				await groupsModel.bulkCreate(list);
				list = [];
			}
		}

		if (list.length > 0) {
			list = _.uniqWith(list, compare);
			await groupsModel.bulkCreate(list);
		}

		return this.success(datas);
	}

	async convertGroupMember(data) {
		const usersModel = this.ctx.model.users;
		const groupsModel = this.ctx.model.groups;
		const membersModel = this.ctx.model.members;

		let user = await usersModel.findOne({where:{username: data.username}});
		let member = await usersModel.findOne({where:{username: data.memberName}});
		if (!user || !member) return console.log("用户丢失", data);
		let group = await groupsModel.findOne({where: {
			userId: user.id,
			groupname: data.groupname,
		}});
		if (!group) {
			console.log("组不存在", data);
			return;
		}
		let groupMember = {
			id: data._id,
			userId: user.id,
			objectId: group.id,
			objectType: ENTITY_TYPE_GROUP,
			memberId: member.id,
		};

		return groupMember;
		//console.log("导入组成员", groupMember);
		//return await membersModel.create(groupMember);
		//return await membersModel.upsert(groupMember);
	}

	async groupMembers() {
		const membersModel = this.ctx.model.members;
		const compare = (s1, s2) => s1.objectId == s2.objectId && s1.objectType == s2.objectType && s1.memberId == s2.memberId;
		const datas = await axios.get(this.keepworkApiUrlPrefix() + "group_user/export").then(res => res.data);
		let list = [];
		for (let i = 0; i < datas.length; i++) {
			let data = datas[i];
			const member = await this.convertGroupMember(data);
			if (member) list.push(member);
			if (list.length == 300) {
				list = _.uniqWith(list, compare);
				await membersModel.bulkCreate(list);
				list = [];
			}
		}

		if (list.length > 0) {
			list = _.uniqWith(list, compare);
			await membersModel.bulkCreate(list);
		}

		return this.success(datas);
	}

	async convertSiteGroup(data) {
		const usersModel = this.ctx.model.users;
		const sitesModel = this.ctx.model.sites;
		const groupsModel = this.ctx.model.groups;

		let user = await usersModel.findOne({where:{username:data.username}});
		let groupUser = await usersModel.findOne({where:{username: data.groupUsername}});
		if (!user || !groupUser) return;
		let site = await sitesModel.findOne({where:{userId:user.id, sitename:data.sitename}});
		let group = await groupsModel.findOne({where: {
			userId: groupUser.id,
			groupname: data.groupname,
		}});
		if (!group || !site) return;
		let siteGroup = {
			id: data._id,
			userId: user.id,
			siteId: site.id,
			groupId: group.id,
			level: data.level > 20 ? USER_ACCESS_LEVEL_WRITE : (data.level > 10 ? USER_ACCESS_LEVEL_READ : USER_ACCESS_LEVEL_NONE),
		};

		//console.log("导入站点组", siteGroup);
		return siteGroup;
		//await siteGroupsModel.create(siteGroup);
		//await siteGroupsModel.upsert(siteGroup);
	}

	async siteGroups() {
		const siteGroupsModel = this.ctx.model.siteGroups;
		const compare = (s1, s2) => s1.siteId == s2.siteId && s1.groupId == s2.groupId;
		const datas = await axios.get(this.keepworkApiUrlPrefix() + "site_group/export").then(res => res.data);
		let list = [];
		for (let i = 0; i < datas.length; i++) {
			let data = datas[i];
			const siteGroup = await this.convertSiteGroup(data);
			if (siteGroup) list.push(siteGroup);
			if (list.length == 300) {
				list = _.uniqWith(list, compare);
				await siteGroupsModel.bulkCreate(list);
				list = [];
			}
		}

		if(list.length > 0) {
			list = _.uniqWith(list, compare);
			await siteGroupsModel.bulkCreate(list);
		}

		return this.success(datas);
	}

	async data(ctx) {
		const params = ctx.state.params;
		const tablename = params.tablename;
		const data = params.data;
		if (!data) return this.success("PARAMS ERROR");
		if (params.token != config.token) return this.success("NO PERMISSTION");

		if (tablename == "users") return await this.convertUser(data);
		if (tablename == "sites") return await this.convertSite(data);
		if (tablename == "groups") return await this.convertGroup(data);
		if (tablename == "groupMembers") return await this.convertGroupMember(data);
		if (tablename == "siteGroups") return await this.convertSiteGroup(data);

		return this.success("OK");
	}

	async deleteData(ctx) {
		const params = ctx.state.params;
		const tablename = params.tablename;
		const id = params.id;
		const model = models[tablename];
		if (!model) return this.success("PARAMS ERROR");
		if (params.token != config.token) return this.success("NO PERMISSTION");

		const result = await model.destroy({where:{id}});

		if (tablename == "groups") {
			const groupMembersModel = models["groupMembers"];
			await groupMembersModel.destroy({where:{groupId:id}});
			const siteGroupsModel = models["siteGroups"];
			await siteGroupsModel.destroy({where:{groupId:id}});
		}

		return this.success("OK");
	}
}

module.exports = Convert;
