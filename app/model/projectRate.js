
const _ = require("lodash");

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		FLOAT,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
		DECIMAL,
	} = app.Sequelize;

	const model = app.model.define("projectRates", {
		// 记录ID
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		// 用户Id
		userId: {
			type: BIGINT,
			defaultValue: 0,
		},

		// 项目Id
		projectId: {
			type: BIGINT,
			defaultValue: 0,
		},

		// 分数 0-100 
		rate: {
			type: INTEGER,
			defaultValue: 0,
		},

		// 额外数据
		extra: {
			type: JSON,
			defaultValue: {},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',

		indexes: [
		{
			unique: true,
			fields: ["userId", "projectId"],
		},
		],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});

	model.__hook__ = async function(data, oper) {
		this.statisticsRate(data, oper);
	}

	model.statisticsRate = async function(data, oper) {
		//if (oper != "create") return;
		//const {projectId, rate} = data;
		//if (!projectId) return;
		//const project = await app.model.projects.getById(projectId);
		//if (!project) return;
		//const type = app.model.QueryTypes.SELECT;
		////let arr = await app.model.query(`select avg(rate) as avgrate from projectRates`, {type});
		////if (arr.length != 1) return;
		////const projectsAvgRate = _.toNumber(arr[0]["avgrate"]);
		//const projectsAvgRate = 70;
		//const arr = await app.model.query(`select avg(rate) as avgrate, count(*) as count from projectRates where projectId = :projectId`, {
			//type,replacements: {projectId},
		//});
		//if (arr.length != 1) return;
		//const projectAvgRate = _.toNumber(arr[0]["avgrate"]);
		//const projectRateCount = _.toNumber(arr[0]["count"]);
		//const rateThreshold = 20;
		//const projectRate = projectRateCount < 8 ? 0 : (projectRateCount / (projectRateCount + rateThreshold) * projectAvgRate + rateThreshold / (projectRateCount + rateThreshold) *projectsAvgRate);
	
		//const extra = project.extra || {};
		//extra.rate = extra.rate || {};
		//const rateLevel = _.floor(rate / 20);
		//extra.rate[rateLevel] = (extra.rate[rateLevel] || 0) + 1;
		//extra.rate.count = projectRateCount;

		//await app.model.projects.update({rate:projectRate, rateCount:projectRateCount, extra}, {where:{id: projectId}});

		//project.rate = projectRate;
		//project.extra = extra;

		//app.api.projectsUpsert(project);
	}

	app.model.projectRates = model;
	return model;
};



