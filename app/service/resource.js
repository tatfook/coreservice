
const _ = require("lodash");
const Service = require("../core/service.js");

const resources = require("./resource/index.js");

class Resource extends Service {
	
	getResourceByName(name) {
		if (!resources[name]) return;

		return new (resources[name])(this.app);
	}
}

module.exports = Resource;
