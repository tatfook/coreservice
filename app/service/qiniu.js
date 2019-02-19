
const _ = require('lodash');
const DataLoader = require('dataloader');
const qiniu = require("qiniu");
const Service = require("../core/service.js");

class Qiniu extends Service {
	getConfig() {
		const config = this.app.config.self;
		const accessKey = config.qiniu.accessKey;
		const secretKey = config.qiniu.secretKey;
		const bucketName = config.qiniu.bucketName;
		const bucketDomain = config.qiniu.bucketDomain;
		const publicBucketName = config.qiniuPublic.bucketName;
		const publicBucketDomain = config.qiniuPublic.bucketDomain;

		//const apiUrlPrefix = config.origin + config.baseUrl;
		const apiUrlPrefix = "http://39.106.11.114:8002/api/v0/";
		const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
		const qiniuConfig = new qiniu.conf.Config();
		//config.zone = qiniu.zone.Zone_z2;
		const bucketManager = new qiniu.rs.BucketManager(mac, qiniuConfig);
		const operateManager = new qiniu.fop.OperationManager(mac, qiniuConfig);
		return  {
			accessKey,
			secretKey,
			bucketName,
			bucketDomain,
			publicBucketName,
			publicBucketDomain,
			mac,
			apiUrlPrefix,
			bucketManager,
			operateManager,
		}
	}

	async persistentHandle({bucket, key, fop, cache={}}) {
		const {publicBucketName, operateManager, apiUrlPrefix} = this.getConfig();
		//处理指令集合
		const saveBucket = bucket || publicBucketName;
		const fops = [
		  fop + '|saveas/' + qiniu.util.urlsafeBase64Encode(publicBucketName + ":" + "thumb-" + key),
		];
		const pipeline = "keepwork";
		const options = {
		  'notifyURL': apiUrlPrefix + "qinius/fopCallback",
		  'force': false,
		};
		const self = this;
		//持久化数据处理返回的是任务的persistentId，可以根据这个id查询处理状态
		//operManager.pfop(srcBucket, srcKey, fops, pipeline, options, function(err, respBody, respInfo) {
		return new Promise((resolve, reject) => {
			operateManager.pfop(publicBucketName, key, fops, pipeline, options, function(err, respBody, respInfo) {
			  if (err) reject(err);
			  if (respInfo.statusCode == 200) {
				  const persistentId = respBody.persistentId;
				  self.app.model.caches.put(persistentId, {...cache, srcBucket: saveBucket, srcKey:key, dstBucket: saveBucket, dstKey: "thumb-" + key})
				  resolve(true);
			  } else {
				  console.log(respInfo.statusCode);
				  console.log(respBody);
				  reject(false);
			  }
			});
		});
	}

	async persistentHandleCallback(params) {
		const persistentId = params.id;
		const cache = await this.app.model.caches.get(persistentId);
		if (!cache) return;
		const {srcBucket, srcKey, dstBucket, dstKey} = cache;
		const {bucketManager} = this.getConfig();
		const result = new Promise((resolve, reject) => {
			bucketManager.move(dstBucket, dstKey, srcBucket, srcKey, {force:true}, (err, respBody, respInfo) => {
				if (err) {
				  console.log(err);
				  return resolve(false);
				} else {
				  return resolve(true);
				}
			});
		});

		return result;
	}

	//storage.getUploadToken = function(key, isPublic = false) {
		//const config = app.config.self;
		//const {bucketName, publicBucketName, mac} = this.getConfig();
		//let scope = isPublic ? publicBucketName : bucketName;
		//if (key) scope += ":" + key;
		//const options = {
			//scope: scope,
			//expires: 3600 * 24, // 一天
			////returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)"}',
		//}
		//if (isPublic) {
			//options.returnBody = '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)"}';
		//} else {
			//options.callbackUrl = config.origin + config.baseUrl + "files/qiniu";
			//options.callbackBody =  '{"key":"$(key)","hash":"$(etag)","size":$(fsize),"bucket":"$(bucket)","mimeType":"$(mimeType)","filename":"$(x:filename)","siteId":$(x:siteId)}';
			//options.callbackBodyType = 'application/json';
		//}

		//const putPolicy = new qiniu.rs.PutPolicy(options);
		//const token = putPolicy.uploadToken(mac);

		//return token;
	//}
}

module.exports = Qiniu;
