
/* 机构表单 */

const _ = require("lodash");

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("lessonOrganizationForms", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		userId: {                      // 用户ID
			type: BIGINT,
			defaultValue: 0,
		},

		organizationId: {
			type: BIGINT,
			defaultValue: 0,
		},

		state: {                       // 关联状态 0 - 未发布  1 - 进行中  2 - 已停止
			type: INTEGER,
			defaultValue: 0,
		},

		type: {
			type: INTEGER,
			defaultValue: 0,
		},

		title: {
			type: STRING,
			defaultValue:"",
		},

		description: {
			type: STRING(1024),
			defaultValue:"",
		},

		text: {
			type: TEXT,
		},

		quizzes: {
			type: JSON,
		},

		extra: {                       // 附加数据
			type: JSON,
			defaultValue:{},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});
	
	app.model.lessonOrganizationForms = model;

	return model;
};


































