
module.exports = app => {
	const {
		BIGINT,
		STRING,
		INTEGER,
		TEXT,
		DATE,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("logs", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		level: {
			type: STRING(12),
			defaultValue: "DEBUG",
		},

		text: {
			type: TEXT,
			defaultValue: "",
		},

		date: {
			type: STRING(24),
			defaultValue: "",
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});
	
	model.output = async function(text, level = "DEBUG") {
		await app.model.logs.create({text, level});
	}
	model.debug = async function(text) {
		await this.output(text, "DEBUG");
	}

	model.info = async function(text) {
		await this.output(text, "INFO");
	}
	
	model.warn = async function(text) {
		await this.output(text, "WARN");
	}

	model.error = async function(text) {
		await this.output(text, "ERROR");
	}

	app.model.logs = model;
	return model;
}
