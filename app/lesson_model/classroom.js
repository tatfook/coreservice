
const _ = require("lodash");
const consts = require("../core/consts.js");

module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		DATE,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("classrooms", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		userId: {
			type: BIGINT,
			allowNull: false,
		},

		classId: {         // 课堂Id
			type: BIGINT,
			defaultValue: 0
		},

		packageId: {   // 所属课程包ID
			type: BIGINT,
			allowNull: false,
		},

		lessonId: {
			type: BIGINT,
			allowNull: false,
		},

		key: {
			type: STRING(24),
			unique: true,
		},

		state: { // 0 -- 未上课  1 -- 上可中  2 -- 上课结束 
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


	app.lessonModel.classrooms = model;

	return model;
}
