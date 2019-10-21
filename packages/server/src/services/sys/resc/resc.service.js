const _ = require('lodash');
const errors = require('@zero/errors');

const { SysService } = require('../service');

module.exports = function (app) {
  new RescService({}, app).register('resc', {});
};

class RescService extends SysService {
  _setup (app) {
    const cfg = require('./resc.config')(app);
    this.cfg = cfg;

    app.set('sys.resc', cfg);
  }

  getConfig () {
    return this.cfg;
  }

  getStore (key) {
    const { stores } = this.cfg;
    const store = stores[key];

    return store;
  }

  /**
   * getUptoken - 获取资源上传token, 默认上传到临时目录
   *
   * @param  {type} appId      应用Id
   * @param  {type} prefix     description
   * @param  {type} objId      提供prefix后生效，根据prefix为不通含义，如prefix为APP,则objId为appId
   * @param  {type} bucketKey  description
   * @param  {type} extName    description
   * @return {type}            description
   */
  async getUptoken (options) {
    let cfg = this.cfg;

    let { appId, objId, prefix, bucket, extName } = options;
    bucket = bucket || 'tmp';

    const { rescPrefixs } = cfg;

    if (prefix && !_.includes(rescPrefixs, prefix)) {
      return null;
    }

    const idsService = zero.service('core/ids');
    let srcIdKey = await idsService.gen();

    let srcKey = appId || '_';

    if (prefix) {
      srcKey += `/${prefix}`;

      if (objId) {
        srcKey += objId;
      }
    } else {
      srcKey += '/_TMP';
    }

    srcKey += `/${srcIdKey}`;

    if (extName) {
      srcKey += `/${extName}`;
    }

    const qiniuService = zero.service('open/qiniu');
    
    let uptoken = await qiniuService.getUptoken({
      bucketKey: bucket,
      srcKey
    });

    return uptoken;
  }

  /**
   * store - 保存资源
   * @param {string} key 存储key
   * @param {ref} data 数据
   */
  async store (key, data) {
    let { tmpKey, url } = data;
  
    if (!tmpKey && !url) {
      throw new errors.InnerError('请提供资源临时key或地址。');
    }

    const store = this.getStore(key);
  
    if (!store) {
      throw new errors.InnerError(`未找到名称为"${key}"的存储。`);
    }
  
    if (!store.getKey) {
      throw new errors.InnerError('获取资源键错误。');
    }
  
    const qiniuService = zero.service('open/qiniu');
    const rescKeyData = await store.getKey(data);
  
    if (data.tmpKey) {
      await qiniuService.move({
        srcBucket: 'tmp',
        srcKey: data.tmpKey,
        destBucket: 'resc',
        destKey: rescKeyData.key
      });
    } else if (data.url) {
      await qiniuService.fetch({
        url: data.url,
        bucket: 'resc',
        key: rescKeyData.key
      });
    }
  
    // 用户头像
    if (store.avatar
      && rescKeyData
      && rescKeyData.avatarKey) {
      await qiniuService.copy({
        srcBucket: 'resc',
        srcKey: rescKeyData.key,
        destBucket: 'resc',
        destKey: `avatars/${rescKeyData.avatarKey}`,
        options: { force: true }
      });
    }
  
    return rescKeyData;
  }

  /**
   * remove - 删除资源
   * @param {string} key 资源名
   * @param {ref} data 数据
   */
  async remove (key, data) {
    let delKey = data.delKey || data.key;

    if (!delKey) {
      throw new Error('请提供资源key。');
    }

    const store = this.getStore(key);

    if (!store) {
      throw new Error(`未找到名称为"${key}"的存储。`);
    }

    const qiniuService = zero.service('open/qiniu');

    await qiniuService.remove({
      bucket: 'resc',
      key: delKey
    });

    if (data.delAvatarKey) {
      await qiniuService.remove({
        bucket: 'resc',
        key: data.delAvatarKey
      });
    }
  }
}
