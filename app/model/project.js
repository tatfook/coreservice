
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

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		FLOAT,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const attrs = {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 拥有者
			type: BIGINT,
			allowNull: false,
		},

		name: {                      // 项目名称
			type: STRING(255),
			allowNull: false,
		},

		siteId: {                    // 站点Id
			type: BIGINT,
		},

		status: {                    // 项目状态  0 -- 创建失败  1  -- 创建中   2 --  创建成功
			type: INTEGER,
			defaultValue: 0,
		},

		visibility: {		         // 可见性 0 - 公开 1 - 私有
			type: INTEGER, 
			defaultValue: 0,
		},

		privilege: {                 // 权限
			type: INTEGER,
			defaultValue: 0,
		},

		type: {                      // 评论对象类型  0 -- paracrfat  1 -- 网站 
			type: INTEGER,
			allowNull: false,
			defaultValue: 1,
		},

		tags: {                      // 项目tags
			type:STRING(255),
			defaultValue:"|",
		},

		visit: {                     // 访问量
			type: INTEGER,
			defaultValue:0,
		},

		star: {                      // 点赞数量
			type: INTEGER,
			defaultValue: 0,
		},

		favorite: {                  // 收藏量
			type: INTEGER,
			defaultValue:0,
		},

		comment: {                   // 评论数量
			type: INTEGER,
			defaultValue: 0,
		},

		lastVisit: {                 // 最近访问量
			type: INTEGER,
			defaultValue:0,
		},

		lastStar: {                  // 最近点赞数量
			type: INTEGER,
			defaultValue: 0,
		},

		lastComment: {               // 最近评论数量
			type: INTEGER,
			defaultValue: 0,
		},

		stars: {                     // 点赞用户id 列表
			type: JSON,
			defaultValue:[],
		},

		hotNo: {
			type: INTEGER,           // 热门编号
			defaultValue: 0,
		},

		choicenessNo: {              // 精选编号
			type: INTEGER,
			defaultValue: 0,
		},

		description: {               // 项目描述
			type: TEXT,
			defaultValue:"",
		},

		rate: {                      // 项目评分
			type: FLOAT,
			defaultValue:0,
		},

		rateCount: {                 // 项目评分人数
			type: INTEGER,
			defaultValue:0,
		},

		classifyTags: {              // 系统分类tags
			type:STRING(255),
			defaultValue:"|",
		},

		extend: {                    // 后端使用
			type: JSON,
			defaultValue:{},
		},

		extra: {                     // 前端使用
			type: JSON,
			defaultValue: {},
		},
	};

	const opts = {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
		indexes: [
		{
			unique: true,
			fields: ["userId", "name"],
		},
		],
	}
	app.model.illegalProjects = app.model.define("illegalProjects", attrs, opts);

	const model = app.model.define("projects", attrs, opts);

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	model.__hook__ = async function(data, oper) {
		//if (oper == "update") return;

		const {userId} = data;

		const count = await app.model.projects.count({where:{userId}});
		await app.model.userRanks.update({project:count}, {where:{userId}});
		//await app.model.userRanks.increment({project:1})
	}

	model.getById = async function(id, userId) {
		const where = {id};

		if (userId) where.userId = userId;

		const data = await app.model.projects.findOne({where: where});

		return data && data.get({plain:true});
	}

	model.getJoinProjects = async function(userId, visibility, exclude) {

		let sql = `select projects.* from projects, members where 
			members.memberId = :memberId and projects.id = members.objectId 
			and objectType = :objectType`;
		if (visibility != undefined) sql += " and projects.visibility = :visibility";
		if (exclude) sql += " and projects.userId != :memberId"

		const list = app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				memberId: userId,
			   	objectType: ENTITY_TYPE_PROJECT,
				visibility,
			}
		});

		return list;
	}

	model.statistics = async function(id, visit, star, comment) {
		const project = await this.getById(id);
		if (!project) return;
		
		const data = project.extend || {};
		const statistics = data.statistics || {};
		const {year, month, day} = app.util.getDate();
		const curTime = (new Date(year, month, day)).getTime();
		const dayTime = 1000 * 3600 * 24;
		const newStatistics = {};
		for (let i = 0; i < 7; i++) newStatistics[curTime - i * dayTime] = statistics[curTime - i * dayTime] || {visit:0, star:0, comment:0};
		newStatistics[curTime].visit += visit;
		newStatistics[curTime].star += star;
		newStatistics[curTime].comment += comment;
		project.visit += visit;
		project.star += star;
		project.comment += comment;
		project.lastVisit = 0;
		project.lastStar = 0;
		project.lastComment = 0;

		for (let i = 0; i < 3; i++) {
			project.lastVisit += newStatistics[curTime - i * dayTime].visit;
			project.lastStar += newStatistics[curTime - i * dayTime].star;
			project.lastComment += newStatistics[curTime - i * dayTime].comment;
		}
		
		data.statistics = newStatistics;
		project.extend = data;

		await app.model.projects.update(project, {where:{id}});
		
		return;
	}

	model.commentCreateHook = async function(id) {
		await this.statistics(id, 0, 0, 1);
	}

	model.commentDestroyHook = async function(id) {
		await this.statistics(id, 0, 0, -1);
	}

	//model.statistics = async function() {
		//const paracraftCount = await app.model.projects.count({where:{type:PROJECT_TYPE_PARACRAFT}});
		//const siteCount = await app.model.projects.count({where:{type:PROJECT_TYPE_SITE}});
		//const projectCount = paracraftCount + siteCount;

		//const sql = `select count(*) count from projects where privilege & :recuritValue`;
		//const list = await app.model.query(sql, {
			//replacements: {
				//recuritValue: PROJECT_PRIVILEGE_RECRUIT_ENABLE,
			//}
		//});
		//const recuritCount = list[0] ? list[0].count : 0;
		//const userCount = await app.model.users.count({});

		//return {paracraftCount, siteCount, recuritCount, userCount, projectCount}
	//}

	app.model.projects = model;
	return model;
};




