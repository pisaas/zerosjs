const _ = require('lodash');
const path = require('path');
const errors = require('@zerosjs/errors');

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

    const idsService = zeros.service('core/ids');
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

    const qiniuService = zeros.service('open/qiniu');
    
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
  async store (storeKey, data, options, params) {
    if (!params && options) {
      params = options;
    }

    let { app, user } = Object.assign({ app: {}, user: {} }, params);
    
    let { tmpKey, url } = data;
  
    if (!tmpKey && !url) {
      throw new errors.InnerError('请提供资源临时key或地址。');
    }

    const store = this.getStore(storeKey);
  
    if (!store) {
      throw new errors.InnerError(`未找到名称为"${storeKey}"的存储。`);
    }
  
    if (!store.getKey) {
      throw new errors.InnerError('获取资源键错误。');
    }
    
    const destBucket = 'resc';
    const qiniuService = zeros.service('open/qiniu');
    const dataService = zeros.service('data/rescs');

    let rescKeyData = null;
    let statInfo = null;

    // 资源持久化处理队列
    let fops = [];

    let modelData = _.pick(data, [
      'id', 'appid', 'uid', 'uname', 'rtype',
      'name', 'extra', 'status', 'pubed'
    ]);

    modelData = Object.assign({
      appid: app.id,
      uid: user.id,
      uname: user.displayName
    }, modelData, {
      store: storeKey,
      stype: store.type,
      storage: store.storage
    });

    // 为了防止多个await竞争，这里放弃await模式
    return await Promise.resolve().then(() => {
      if (data.id) {
        return;
      }

      // 自定义id
      return zeros.service('core/ids').gen().then((id) => {
        data.id = id;
      });
    }).then(() => {
      if (store.getKey.then) {
        return store.getKey({ data, options, params }).then((res) => {
          rescKeyData = res;
        });
      } else {
        rescKeyData = store.getKey({ data, options, params });
      }
    }).then(() => {
      modelData.path = rescKeyData.key;

      if (!modelData.name) {
        modelData.name = path.basename(rescKeyData.key);
      }

      if (data.tmpKey) {
        return qiniuService.move({
          srcBucket: 'tmp',
          srcKey: data.tmpKey,
          destBucket,
          destKey: rescKeyData.key,
          options
        });
      } else if (data.url) {
        return qiniuService.fetch({
          url: data.url,
          bucket: destBucket,
          key: rescKeyData.key,
          options
        });
      }
    }).then(() => {
      // 获取存储文件信息
      return qiniuService.stat({
        bucket: destBucket,
        key: rescKeyData.key
      }).then((res) => {
        statInfo = res;
      });
    }).then(() => {
      if (!modelData.rtype && statInfo.mimeType) {
        modelData.rtype = statInfo.mimeType.split('/')[0];
      }

      modelData = Object.assign(modelData, {
        fsize: statInfo.fsize,
        mime: statInfo.mimeType,
        md5: statInfo.md5
      });

      // 图片文件，保存缩略图
      if (modelData.rtype === 'image') {
        modelData.path_thumb = `${rescKeyData.key}_thumb`;

        fops.push({
          fop: 'imageView2/0/w/600/h/600/format/jpg',
          key: modelData.path_thumb
        });
      }

      // 用户头像
      if (store.avatar && rescKeyData && rescKeyData.avatarKey) {
        fops.push({
          fop: 'imageView2/0/w/200/h/200/format/jpg',
          key: `avatars/${rescKeyData.avatarKey}`
        });
      }

      if (!fops.length) {
        return;
      }

      return qiniuService.pfop({
        bucket: destBucket,
        key: rescKeyData.key,
        fops,
        options: { force: true }
      });
    }).then(() => {
      // 用户头像
      if (store.avatar
        && rescKeyData
        && rescKeyData.avatarKey) {
        return qiniuService.copy({
          srcBucket: destBucket,
          srcKey: rescKeyData.key,
          destBucket: destBucket,
          destKey: `avatars/${rescKeyData.avatarKey}`,
          options: { force: true }
        });
      }
    }).then(() => {
      return dataService.create(modelData);
    });
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

    const qiniuService = zeros.service('open/qiniu');
    const dataService = zeros.service('data/rescs');

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

    await dataService.remove({ query: { key } });
  }
}
