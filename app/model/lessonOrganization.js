
module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
		DATE,
	} = app.Sequelize;

	const model = app.model.define("lessonOrganizations", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		name: {                        // 名称
			type:STRING,
			defaultValue:"",
			unique: true,
		},

		logo: {
			type: TEXT('long'),
		},

		email: {
			type: STRING,
		},

		cellphone: {
			type: STRING,
		},

		loginUrl: {
			type: STRING,
			unique: true,
		},

		userId: {                     // 组织拥有者
			type: BIGINT,
			defaultValue:0
		},

		startDate: {
			type: DATE,
		},

		endDate: {
			type: DATE,
		},

		state: {                      // 0 - 开启  1 - 停用
			type: INTEGER,
		},

		count: {                      // 用户数量
			type: INTEGER,
			defaultValue: 0,
		},

		privilege: {                 // 权限  1 -- 允许教师添加学生  2 -- 允许教师移除学生
			type: INTEGER,
			defaultValue: 0,
		},

		location: {                  // xxx xxx xxx
			type: STRING,
			defaultValue:"",
		},

		visibility: {                // 0 - 公开  1 - 不公开
			type: INTEGER,
			defaultValue: 0,
		},

		extra: {
			type: JSON,
			defaultValue: {},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});
	
	//获取机构已用人数
	model.getUsedCount = async function(organizationId) {
		const sql = `select count(*) as count from (select * from lessonOrganizationClassMembers where organizationId = ${organizationId} and (roleId & 1 or roleId & 2) group by memberId) as alias`;
		const list = await app.model.query(sql, {type:app.model.QueryTypes.SELECT});
		return list[0].count || 0;
	}

	app.model.lessonOrganizations = model;

	return model;
};

