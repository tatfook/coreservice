const _ = require("lodash");
const qiniu = require("qiniu");
const uuidv1 = require('uuid/v1');

const Controller = require("../core/controller.js");

const Qiniu = class extends Controller {
	async token() {
		const {userId} = this.authenticated();
		const {key} = this.validate({key:"string"});
		const config = this.config.self.qiniuPublic;
		const options = {
			scope: config.bucketName + ":" + key,
			expires: 3600 * 24, // 一天
			returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)"}',
		}
		const mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey);
		const putPolicy = new qiniu.rs.PutPolicy(options);
		const token = putPolicy.uploadToken(mac);

		return this.success(token);
	}

	async uploadToken() {
		const userId = this.ctx.state.user.userId || this.ctx.state.admin.userId;
		if (!userId) return this.fail(403);
		const config = this.config.self;
		const apiUrlPrefix = config.origin + config.baseUrl;
		const key = (this.ctx.state.user.userId ? "user" : "admin") + userId + "-" + uuidv1();
		const options = {
			scope: config.qiniuPublic.bucketName + ":" + key,
			expires: 3600 * 24, // 一天
			callbackUrl: apiUrlPrefix + "qinius/uploadCallback",
			callbackBody:'{"key":"$(key)","hash":"$(etag)","size":$(fsize),"bucket":"$(bucket)","mimeType":"$(mimeType)"}',
			callbackBodyType:"application/json",
		}
		const mac = new qiniu.auth.digest.Mac(config.qiniuPublic.accessKey, config.qiniuPublic.secretKey);
		const putPolicy = new qiniu.rs.PutPolicy(options);
		const token = putPolicy.uploadToken(mac);

		return this.success({token, key});
	}

	async uploadCallback() {
		const config = this.config.self;
		const params = this.validate();
		const url = config.qiniuPublic.bucketDomain + "/" + params.key;
		return this.success({key: params.key, url});
	}

	async fop() {
		const {key, bucket, fop} = this.validate({
			key:"string",
			fop:"string",
		});

		const result = await this.ctx.service.qiniu.persistentHandle({key, bucket, fop});
	}

	async fopCallback() {
		const params = this.validate();
		this.ctx.service.qiniu.persistentHandleCallback(params);
		return this.success();
	}

	async test() {
		this.ctx.service.qiniu.persistentHandle({key:"abc.png", fop:"imageView2/3/w/380/h270"});

		return this.success();
	}
}

module.exports = Qiniu;
