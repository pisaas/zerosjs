const debug = require('debug')('@zerosjs/qiniu');

const _ = require('lodash');
const qiniu = require('qiniu');
const errors = require('@zerosjs/errors');

const { OpenService } = require('../service');

let __digestMac = null;
let __bucketManager = null;
let __operationManager = null;

module.exports = function (app) {
  new QiniuService({ }, app).register('qiniu', {
  });
};

// const ManageOps = [ 'fetch', 'move', 'copy', 'stat', 'remove', 'removeAfterDays', 'refreshUrls' ];
// const ImageSlimNames = { avatar: 'avatar' };
// const ImageSlimExprs = { avatar: 'imageView2/2/w/100/h/100/q/75|imageslim' };

class QiniuService extends OpenService {
  _setup (app) {
    const cfg = require('./qiniu.config')(app);
    this.cfg = cfg;

    app.set('open.qiniu', cfg);
  }

  getConfig () {
    return this.cfg;
  }

  /**
   * 获取真实bucket
   * @param  {[type]} bucket [description]
   * @return {[type]}        [description]
   */
  getBucket (key) {
    const cfg = this.getConfig();
    let bucket = cfg.buckets[key];
  
    if (!bucket) {
      return null;
    }
  
    return bucket;
  }

  getBucketName (name) {
    let bucket = this.getBucket(name);
    if (!bucket) {
      return null;
    }
    return bucket.name;
  }

  /**
   * 获取七牛digest mac
   * @return {[type]} [description]
   */
  getDigestMac () {
    if (__digestMac) {
      return __digestMac;
    }
  
    const cfg = this.getConfig();
    __digestMac = new qiniu.auth.digest.Mac(cfg.AccessKey, cfg.SecretKey);
    return __digestMac;
  }

  getRsPutPolicy (options) {
    return new qiniu.rs.PutPolicy(options);
  }

  /**
   * 获取七牛管理器
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  getBucketManager () {
    if (__bucketManager) {
      return __bucketManager;
    }

    let mac = __digestMac;
    const config = new qiniu.conf.Config();
    __bucketManager = new qiniu.rs.BucketManager(mac, config);

    return __bucketManager;
  }

  getOperationManager () {
    if (__operationManager) {
      return __operationManager;
    }

    let mac = __digestMac;
    const config = new qiniu.conf.Config();
    __operationManager = new qiniu.fop.OperationManager(mac, config);

    return __operationManager;
  }

  async getUptoken (params) {
    let { bucketKey, srcKey } = params;

    let bucket = this.getBucket(bucketKey);

    let { name, domain } = bucket;
    let { expires, returnBody } = bucket.uptoken;


    let opts = {
      scope: `${name}:${srcKey}`,
      expires,
      returnBody: zeros.util.stringify(returnBody)
    };

    const qiniuMac = this.getDigestMac();
    const putPolicy = this.getRsPutPolicy(opts);
    const token = putPolicy.uploadToken(qiniuMac);
    const uploadUrl = this.cfg.clientUploadUrl;

    return { token, domain, uploadUrl, key: srcKey };
  }

  /**
   * 抓取网络资源到空间
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  fetch (params) {
    let { url, bucket: descBucket, key: srcKey } = params;
    let bucketName = this.getBucketName(descBucket);

    return this.getBucketManagerPromise('fetch', url, bucketName, srcKey);
  }

  /**
   * 移动文件
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  move (params) {
    let { srcBucket: srcBucketKey, srcKey, destBucket: descBucketKey, destKey, options } = params;
    let srcBucketName = this.getBucketName(srcBucketKey);
    let destBucketName = this.getBucketName(descBucketKey);

    return this.getBucketManagerPromise('move', srcBucketName, srcKey, destBucketName, destKey, options);
  }

  /**
   * 复制文件
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  copy (params) {
    let { srcBucket: srcBucketKey, srcKey, destBucket: descBucketKey, destKey, options } = params;
    let srcBucketName = this.getBucketName(srcBucketKey);
    let destBucketName = this.getBucketName(descBucketKey);

    return this.getBucketManagerPromise('copy', srcBucketName, srcKey, destBucketName, destKey, options);
  }

  /**
   * 删除文件
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  remove (params) {
    let { bucket: bucketKey, key: srcKey } = params;
    let bucketName = this.getBucketName(bucketKey);

    return this.getBucketManagerPromise('delete', bucketName, srcKey);
  }

  /**
   * 获取文件信息
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  stat (params) {
    let { bucket: bucketKey, key: srcKey } = params;
    let bucketName = this.getBucketName(bucketKey);

    return this.getBucketManagerPromise('stat', bucketName, srcKey);
  }

  /**
   * 设置文件有效期
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  removeAfterDays (params) {
    let { bucket: bucketKey, key: srcKey, days } = params;
    let bucketName = this.getBucketName(bucketKey);

    return this.getBucketManagerPromise('deleteAfterDays', bucketName, srcKey, days);
  }

  // 文件刷新
  refreshUrls (params) {
    let { urls } = params;
    return this.getBucketManagerPromise('refreshUrls', urls);
  }

  // 持久化数据处理
  pfop (params) {
    const cfg = this.getConfig();

    let { bucket: bucketKey, key: srcKey, fops: fopsArr, pipeline, options } = params;

    if (!fopsArr || !fopsArr.length) {
      return Promise.resolve();
    }

    let bucketName = this.getBucketName(bucketKey);
    pipeline = pipeline || cfg.pipeline;

    let fops = fopsArr.map((it) => {
      let saveasUri = qiniu.util.urlsafeBase64Encode(`${bucketName}:${it.key}`);
      return `${it.fop}|saveas/${saveasUri}`;
    });

    return this.getOperationManagerPromise('pfop', bucketName, srcKey, fops, pipeline, options);
  }

  getOperationManagerPromise (op) {
    let args = _.drop(arguments);
    const manager = this.getOperationManager();
    return this.getQiniuManagerPromise(manager, op, args);
  }

  /**
   * 获取七牛Promise
   * @param  {[type]} op [description]
   * @return {[type]}    [description]
   */
  getBucketManagerPromise (op) {
    let args = _.drop(arguments);
    const manager = this.getBucketManager();
    return this.getQiniuManagerPromise(manager, op, args);
  }

  getQiniuManagerPromise (manager, op, args) {
    args = args || [];
    
    return new Promise((resolve, reject) => {
      args.push((err, body, info) => {
        if (err) {
          return reject(err);
        }

        if (info.statusCode !== 200) {
          debug('QiniuRequest:', info, body, arguments);

          return reject(new errors.InnerError('调用七牛接口出错。'));
        }

        return resolve(body);
      });

      try {
        manager[op].apply(manager, args);
      } catch (ex) {
        return reject(ex);
      }
    });
  }
}
