
const fs = require("fs");
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const sensitiveWords = require("./sensitiveWords.js");

const SensitiveWord = class extends Controller {
	get modelName() {
		return "sensitiveWords";
	}

	async index() {
		const query = this.validate();

		const list = await this.model.sensitiveWords.findAll({...this.queryOptions, where: query});

		return this.success(list);
	}

	async importOldWords() {
		const words = [];
		_.each(sensitiveWords, o => {
			const word = o.name;

			for (let i = 0; i < words.length; i++) {
				if (words[i] == word) return;
			}
			words.push(word);
		});
		await this.model.sensitiveWords.bulkCreate(_.map(words, o => {return {word: o}}));
		return this.success("OK");
	}

	async importWords() {
		let {words} = this.validate();
		//const wordstr = await new Promise((resolve, reject) => {
			//fs.readFile("./app/public/sensitive_word.txt", function(err, data) {
				//if (err) {
					//console.log("加载铭感词文件失败");
					//return resolve("");
				//}
				//return resolve(data.toString());
			//});

		//});
		
		if (!_.isString(words) && !_.isArray(words)) return this.throw(400);
		words = _.isString(words) ? words.split(",") : words;
		//for (let i = 0; i < words.length; i++) {
			//const word = words[i].trim();
			//await this.model.sensitiveWords.upsert({word});
		//}
		
		await this.model.sensitiveWords.bulkCreate(_.map(words, o => {return {word: o.trim()}}));
		return this.success(words.length);
	}

	async trim() {
		const list = await this.model.sensitiveWords.findAll({limit:100000});
		console.log(list.length);
		for (let i = 0; i < list.length; i++) {
			const o = list[i].get({plain:true});
			o.word = o.word.trim();
			try {
				await this.model.sensitiveWords.update(o, {where:{id:o.id}});
			} catch(e) {

			}
		}

		return this.success("OK");
	}

	async check() {
		const {word} = this.validate();

		const data = await this.app.ahocorasick.check(word);

		return this.success(data);
	}
}

module.exports = SensitiveWord;
