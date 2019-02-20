
const _ = require('lodash');
const DataLoader = require('dataloader');
const qiniu = require("qiniu");
const Service = require("../core/service.js");
const uuidv1 = require('uuid/v1');

class Qiniu extends Service {
	getConfig() {
		const config = this.app.config.self;
		const accessKey = config.qiniu.accessKey;
		const secretKey = config.qiniu.secretKey;
		const bucketName = config.qiniu.bucketName;
		const bucketDomain = config.qiniu.bucketDomain;
		const publicBucketName = config.qiniuPublic.bucketName;
		const publicBucketDomain = config.qiniuPublic.bucketDomain;

		const apiUrlPrefix = config.origin + config.baseUrl;
		//const apiUrlPrefix = "http://39.106.11.114:8002/api/v0/";
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

	getUploadToken({key, bucket}) {
		const {bucketName, publicBucketName, mac, apiUrlPrefix} = this.getConfig();

		key = key || uuidv1();
		bucket = bucket || publicBucketName;

		const scope = (bucket || publicBucketName) + ":" + key;
		const options = {scope: scope};

		if (bucket == publicBucketName) {
			options.returnBody = '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)"}';
		} else {
			options.expires = 3600 * 24;
			options.callbackUrl = apiUrlPrefix + "files/qiniu";
			options.callbackBody =  '{"key":"$(key)","hash":"$(etag)","size":$(fsize),"bucket":"$(bucket)","mimeType":"$(mimeType)","filename":"$(x:filename)","siteId":$(x:siteId)}';
			options.callbackBodyType = 'application/json';
		}

		const putPolicy = new qiniu.rs.PutPolicy(options);
		const token = putPolicy.uploadToken(mac);

		return token;
	}

	getDownloadUrl({key, domain, expires = 3600 * 24}) {
		const {bucketManager, bucketDomain} = this.getConfig();
		const privateBucketDomain = domain || bucketDomain;
		const deadline = parseInt(Date.now() / 1000) + expires; 
		const privateDownloadUrl = bucketManager.privateDownloadUrl(privateBucketDomain, key, deadline);
		return privateDownloadUrl;
	}

	async upload({key, content, bucket}) {
		const {mac, publicBucketName} = this.getConfig();
		const putPolicy = new qiniu.rs.PutPolicy({scope: (bucket || publicBucketName) + ":" + key});
		const token = putPolicy.uploadToken(mac);

		const putExtra = new qiniu.form_up.PutExtra();
		const config = new qiniu.conf.Config();
		config.zone = qiniu.zone.Zone_z2; // 华南

		const result = await new Promise((resolve, reject) => {
			const formUploader = new qiniu.form_up.FormUploader(config);
			formUploader.put(token, key, content, putExtra, function(respErr, respBody, respInfo){
				if (respErr || respInfo.statusCode != 200) {
					//console.log(respErr, respInfo.statusCode, respBody);
					//return resolve(false);
					return reject({statusCode: respInfo.statusCode, body:respBody});
				} 

				//console.log(respBody);
				return resolve(respBody);
				//return resolve(true);
			});
		});

		return result;
	}

	async delete({key, bucket}) {
		const {publicBucketName, bucketManager} = this.getConfig();
		
		const result = await new Promise((resolve, reject) => {
			bucketManager.delete(bucket || publicBucketName, key, function(respErr, respBody, respInfo){
				if (respInfo.statusCode != 200 && respInfo.statusCode != 612) {
					//console.log(respErr, respInfo.statusCode, respBody);
					return resolve(false);
				}
				
				return resolve(true);
			});
		});

		return result;
	}

	async move({srcKey, dstKey, srcBucket, dstBucket}) {
		const {publicBucketName, bucketManager} = this.getConfig();
		
		const result = await new Promise((resolve, reject) => {
			bucketManager.move(srcBucket || publicBucketName, srcKey, dstBucket || publicBucketName, dstKey, {force:true}, function(respErr, respBody, respInfo){
				if (respErr || respInfo.statusCode != 200) {
					//console.log(respErr, respInfo.statusCode, respBody);
					return resolve(false);
				}
				
				return resolve(true);
			});
		});

		return result;
	}

	async batch(ops) {
		const {bucketManager} = this.getConfig();
		const result = await new Promise((resolve, reject) => {
			bucketManager.batch(ops, function(respErr, respBody, respInfo){
				if (respErr || respInfo.statusCode != 200) {
					//console.log(respErr, respInfo.statusCode, respBody);
					return resolve(false);
				}
				
				return resolve(true);
			});
		});

		return result;
	}

	async batchMove(list) {
		const {publicBucketName, bucketManager} = this.getConfig();
		const moveOperations = [];
		for (var i = 0; i < list.length; i++) {
			moveOperations.push(qiniu.rs.moveOp(list[i].srcBucket || publicBucketName, list[i].srcKey, list[i].dstBucket || publicBucketName, list[i].dstKey));
		}

		return await this.batch(moveOperations);
	}

	async batchDelete(list) {
		const {publicBucketName, bucketManager} = this.getConfig();
		const deleteOps = [];

		_.each(list, item => deleteOps.push(qiniu.rs.deleteOp(item.bucket || publicBucketName, item.key)));
		
		return await this.batch(deleteOps);
	}

	async get({key, bucket}) {
		const url = this.getDownloadUrl({key, bucket});
		const content = await axios.get(url).then(res => res.data);
		return content;
	}

	async list({prefix = "", limit = 200, marker, bucket}) {
		const options = {
			limit: limit,
			prefix: prefix,
			marker: marker,
		}

		const {publicBucketName, bucketManager} = this.getConfig();
		const result = await new Promise((resolve, reject) => {
			bucketManager.listPrefix(bucket || publicBucketName, options, function(respErr, respBody, respInfo){
				if (respErr || respInfo.statusCode != 200) {
					//console.log(respErr, respInfo.statusCode, respBody);
					//return resolve(false);
					return reject({statusCode: respInfo.statusCode, body:respBody});
				}
				return resolve({
					marker: respBody.marker,
					prefix: respBody.commonPrefixes,
					items: respBody.items,
				});
			});
		});

		return result;
	}
}

module.exports = Qiniu;
