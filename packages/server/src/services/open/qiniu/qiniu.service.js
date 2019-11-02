const debug = require('debug')('@zerojs/server/services/open/qiniu');

const _ = require('lodash');
const qiniu = require('qiniu');
const errors = require('@zerojs/errors');

const { OpenService } = require('../service');

let __digestMac = null;
let __bucketManager = null;

module.exports = function (app) {
  new QiniuService({ }, app).register('qiniu', {
  });
};

// const ManageOps = [ 'fetch', 'move', 'copy', 'remove', 'removeAfterDays', 'refreshUrls' ];
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

  async getUptoken (params) {
    let { bucketKey, srcKey } = params;

    let bucket = this.getBucket(bucketKey);

    let { name, domain } = bucket;
    let { expires, returnBody } = bucket.uptoken;


    let opts = {
      scope: `${name}:${srcKey}`,
      expires,
      returnBody: zero.$json.stringify(returnBody)
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

    return this.getQiniuPromise('fetch', url, bucketName, srcKey);
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

    return this.getQiniuPromise('move', srcBucketName, srcKey, destBucketName, destKey, options);
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

    return this.getQiniuPromise('copy', srcBucketName, srcKey, destBucketName, destKey, options);
  }

  /**
   * 删除文件
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  remove (params) {
    let { bucket: bucketKey, key: srcKey } = params;
    let bucketName = this.getBucketName(bucketKey);

    return this.getQiniuPromise('delete', bucketName, srcKey);
  }

  /**
   * 设置文件有效期
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  removeAfterDays (params) {
    let { bucket: bucketKey, key: srcKey, days } = params;
    let bucketName = this.getBucketName(bucketKey);

    return this.getQiniuPromise('deleteAfterDays', bucketName, srcKey, days);
  }

  // 文件刷新
  refreshUrls (params) {
    let { urls } = params;
    return this.getQiniuPromise('refreshUrls', urls);
  }

  /**
   * 获取七牛Promise
   * @param  {[type]} op [description]
   * @return {[type]}    [description]
   */
  getQiniuPromise (op) {
    return new Promise((resolve, reject) => {
      const bucketManager = this.getBucketManager();

      let args = _.drop(arguments);

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
        bucketManager[op].apply(bucketManager, args);
      } catch (ex) {
        return reject(ex);
      }
    });
  }
}
