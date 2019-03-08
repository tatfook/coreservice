
module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		DATE,
		JSON,
		TEXT,
	} = app.Sequelize;
	
	const model = app.model.define("lessons", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		userId: {
			type: BIGINT,
			allowNull: false,
		},

		lessonName: {
			type: STRING,
			allowNull: false,
		},

		subjectId: {
			type: BIGINT,
		},

		url: {
			type: STRING,
			unique: true,
			//allowNull: false,
		},

		goals: {
			type: TEXT,
		},

		extra: {
			type: JSON,
			defaultValue: {
				coverUrl: "",
				vedioUrl: "",
			},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	app.lessonModel.lessons = model;

	return model;
}
