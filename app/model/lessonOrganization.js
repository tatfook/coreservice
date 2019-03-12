
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

		cellphone: {
			type: STRING,
		},

		loginUrl: {
			type: STRING,
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

		teacherCount: {               // 教师数量
			type: INTEGER,
			defaultValue: 0,
		},

		studentCount: {               // 学生数量
			type: INTEGER,
			defaultValue: 0,
		},

		privilege: {                 // 权限  1 -- 允许教师添加学生  2 -- 允许教师移除学生
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
	
	app.model.lessonOrganizations = model;

	return model;
};

