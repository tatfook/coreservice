const nodemailer = require("nodemailer");
const _ = require("lodash");
const Service = require("../core/service.js");

//sms.send("18702759796", ["2461", "3分钟"]);


class Email extends Service {

	getTransporter(provider) {
		const config = this.app.config.self;
		const transporter = nodemailer.createTransport({
			host: config.email.host,
			port: config.email.port || 587,
			secure: false,
			//secure: true,
			auth: {
				user: config.email.user,
				pass: config.email.pass,
			},
		});

		return transporter;
	}

	async send(to, subject, html, from, provider = "QQ") {
		const config = this.app.config.self;

		const transporter = this.getTransporter(provider);

		const ok = await new Promise((resolve, reject) => {
			transporter.sendMail({
				from: from || config.email.from || config.email.user,
				to,
				subject,
				html,
			}, function(err) {
				if (err) {
					console.log(err);
					return resolve(false);
				}

				return resolve(true);
			});
		});

		return ok;
	}
}

module.exports = Email;
