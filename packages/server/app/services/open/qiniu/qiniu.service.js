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
    name = name || 'resc';
    
    let bucket = this.getBucket(name);
    if (!bucket) {
      return null;
    }
    return bucket.name;
  }

  getFop (key) {
    const cfg = this.getConfig();
    let fop = cfg.fops[key];

    if (!fop.pipeline) {
      fop.pipeline = this.getPipeline(fop.pipelineKey);
    }

    return fop;
  }

  getPipeline (key) {
    key = key || 'default';
    const cfg = this.getConfig();
    let pipeline = cfg.pipelines[key];
    return pipeline;
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

    let mac = this.getDigestMac();
    const config = new qiniu.conf.Config();
    __bucketManager = new qiniu.rs.BucketManager(mac, config);

    return __bucketManager;
  }

  getOperationManager () {
    if (__operationManager) {
      return __operationManager;
    }

    let mac = this.getDigestMac();
    const config = new qiniu.conf.Config();
    __operationManager = new qiniu.fop.OperationManager(mac, config);

    return __operationManager;
  }

  async getUptoken (params) {
    let { bucketKey, srcKey, fopKey, policyOptions } = params;

    let bucket = this.getBucket(bucketKey);

    let { name: bucketName, domain } = bucket;
    let { expires, returnBody } = bucket.uptoken;

    policyOptions = Object.assign({
      scope: `${bucketName}:${srcKey}`,
      expires,
      returnBody: zeros.util.stringify(returnBody)
    }, policyOptions);

    if (fopKey) {
      let fop = this.getFop(fopKey);

      if (!fop) {
        throw new errors.InnerError('无法找到对应的fop。');
      }

      let saveasUri = this.getSaveAsUri(bucketName, srcKey, fopKey);

      policyOptions.persistentOps = `${fop.cmd}|${saveasUri}`;
      policyOptions.persistentPipeline = fop.pipeline;
    }

    const qiniuMac = this.getDigestMac();
    const putPolicy = this.getRsPutPolicy(policyOptions);
    const token = putPolicy.uploadToken(qiniuMac);
    const uploadUrl = this.cfg.clientUploadUrl;

    return { token, domain, uploadUrl, key: srcKey };
  }

  getSaveAsUri (bucketName, key, prefix) {
    let scope = `${bucketName}:${key}`;

    if (prefix) {
      scope += `_${prefix}`;
    }

    let uri = qiniu.util.urlsafeBase64Encode(scope);
    return `saveas/${uri}`;
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
    const thiz = this;

    let { bucket: bucketKey, key: srcKey, fopCmds, fops: fopsArr, options } = params;

    let bucketName = this.getBucketName(bucketKey);
    let pipeline = thiz.getPipeline();

    let fops = [];

    (fopCmds || []).forEach((it) => {
      if (it.pipelineKey) {
        pipeline = thiz.getPipeline(it.pipelineKey);
      } else if (it.pipeline) {
        pipeline = it.pipeline;
      }

      fops.push(it.cmd);
    });
    
    (fopsArr || []).forEach((it) => {
      let fop = this.getFop(it.fopKey);

      if (!fop) {
        throw new errors.InnerError('无法找到对应的fop。');
      }

      if (fop.pipeline) {
        pipeline = fop.pipeline;
      }

      if (!it.descKey) {
        it.descKey = `${srcKey}_${it.fopKey}`;
      }

      let saveasUri = this.getSaveAsUri(bucketName, it.descKey);
      let fopCmd = `${fop.cmd}|${saveasUri}`;

      fops.push(fopCmd);
    });

    if (!fops.length) {
      return Promise.resolve();
    }

    return this.getOperationManagerPromise('pfop', bucketName, srcKey, fops, pipeline, options);
  }

  prefop (id) {
    return this.getOperationManagerPromise('prefop', id);
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

        // 删除时文件不存在，不报错
        if (op === 'delete') {
          if (info.statusCode === 612) {
            return resolve(body);
          }
        }

        if (info.statusCode !== 200) {
          debug('QiniuRequest:', op, info, body, args);

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
