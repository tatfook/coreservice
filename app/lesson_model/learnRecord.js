
const consts = require("../core/consts.js");

module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		DATE,
		JSON,
	} = app.Sequelize;

	const model = app.lessonModel.define("learnRecords", {
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

		packageId: {
			type: BIGINT,
			allowNull: false,
		},

		lessonId: {
			type: BIGINT,
			allowNull: false,
		},

		classroomId: {
			type: BIGINT,
			defaultValue: 0,
		},

		state: { // 0 -- 开始学习  1 -- 学习完成
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


	app.lessonModel.learnRecords = model;
	
	return model;
}


