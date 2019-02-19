
const _ = require('lodash');
const DataLoader = require('dataloader');
const qiniu = require("qiniu");
const Service = require("../core/service.js");

class Qiniu extends Service {
	getConfig() {
		const config = app.config.self;
		const accessKey = config.qiniu.accessKey;
		const secretKey = config.qiniu.secretKey;
		const bucketName = config.qiniu.bucketName;
		const bucketDomain = config.qiniu.bucketDomain;
		const publicBucketName = config.qiniuPublic.bucketName;
		const publicBucketDomain = config.qiniuPublic.bucketDomain;

		const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
		return  {
			accessKey,
			secretKey,
			bucketName,
			bucketDomain,
			publicBucketName,
			publicBucketDomain,
			mac,
		}
	}

	storage.getUploadToken = function(key, isPublic = false) {
		const config = app.config.self;
		const {bucketName, publicBucketName, mac} = this.getConfig();
		let scope = isPublic ? publicBucketName : bucketName;
		if (key) scope += ":" + key;
		const options = {
			scope: scope,
			expires: 3600 * 24, // 一天
			//returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)"}',
		}
		if (isPublic) {
			options.returnBody = '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)"}';
		} else {
			options.callbackUrl = config.origin + config.baseUrl + "files/qiniu";
			options.callbackBody =  '{"key":"$(key)","hash":"$(etag)","size":$(fsize),"bucket":"$(bucket)","mimeType":"$(mimeType)","filename":"$(x:filename)","siteId":$(x:siteId)}';
			options.callbackBodyType = 'application/json';
		}

		const putPolicy = new qiniu.rs.PutPolicy(options);
		const token = putPolicy.uploadToken(mac);

		return token;
	}
}

module.exports = Qiniu;
