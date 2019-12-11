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
  async getUptoken (options, params) {
    let cfg = this.getConfig();

    if (!params && options) {
      params = options;
    }

    const { app } = Object.assign({ app: {}, user: {} }, params);
    const bucket = 'tmp'; // uptoken只支持上传到tmp

    let { objid, prefix, rtype, extName, policyOptions } = options || {};

    if (prefix && !_.includes(cfg.rescPrefixs, prefix)) {
      throw new errors.InnerError('未找到对应前缀。');
    }

    let srcIdKey = await zeros.service('core/ids').gen();

    let srcKey = app.id || '_';

    if (prefix) {
      srcKey += `/${prefix}`;

      if (objid) {
        srcKey += objid;
      }
    } else {
      srcKey += '/_TMP';
    }

    srcKey += `/${srcIdKey}`;

    if (extName) {
      srcKey += `/${extName}`;
    }

    const qiniuService = zeros.service('open/qiniu');
    
    policyOptions = Object.assign({}, policyOptions);
    if (!policyOptions.fsizeLimit || policyOptions.fsizeLimit > cfg.maxUploadSize) {
      policyOptions.fsizeLimit = cfg.maxUploadSize;
    }

    let fopKey = this.getFopKeyByRtype(rtype);
    
    let uptoken = await qiniuService.getUptoken({
      bucketKey: bucket,
      srcKey,
      fopKey,
      policyOptions
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
    
    let modelData = _.pick(data, [
      'id', 'appid', 'uid', 'uname', 'rtype', 'pfopid',
      'name', 'fname', 'desc', 'extra'
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
      if (modelData.id) {
        return;
      }

      // 自定义id
      return zeros.service('core/ids').gen().then((id) => {
        modelData.id = id;
      });
    }).then(() => {
      if (modelData.pfopid) {
        return this.storeByPfop(store, modelData, data, options, params);
      } else {
        return this.storeByResc(store, modelData, data, options, params);
      }
    });
  }

  // 根据资源Key或url存储资源
  async storeByResc (store, modelData, data, options, params) {
    const srcBucket = 'tmp';
    const destBucket = 'resc';

    const qiniuService = zeros.service('open/qiniu');
    const dataService = zeros.service('data/rescs');

    if (!store.getKey) {
      throw new errors.InnerError('获取资源键错误。');
    }

    let destRescKeyData = null;

    let modelChanges = {};
    
    let rescModel = await Promise.resolve().then(() => {
      return store.getKey({ model: modelData, params });
    }).then((res) => {
      destRescKeyData = res;
      modelChanges.path = res.key;

      if (!modelData.name) {
        modelChanges.name = path.basename(modelData.path);
      }

      // 存在_id，则代表模型已创建模型已创建
      if (modelData._id) {
        return dataService.patch(modelData.id, modelChanges);
      } else {
        modelData = Object.assign(modelData, modelChanges);
        return dataService.create(modelData);
      }
    });

    let destRescKey = destRescKeyData.key;

    if (data.tmpKey) {
      await qiniuService.move({
        srcBucket: srcBucket,
        srcKey: data.tmpKey,
        destBucket,
        destKey: destRescKey,
        options
      });
    } else if (data.url) {
      return qiniuService.fetch({
        url: data.url,
        bucket: destBucket,
        key: destRescKey,
        options
      });
    }

    let modelUpdates = {};

    let statInfo = await qiniuService.stat({
      destBucket,
      key: destRescKey
    });

    modelUpdates = Object.assign(modelUpdates, {
      fsize: statInfo.fsize,
      mime: statInfo.mimeType,
      md5: statInfo.md5
    });

    // 保存缩略图
    let thumbUpdates = await this.storeRescThumb(store, rescModel, data, {}, params);
    modelUpdates = Object.assign(modelUpdates, thumbUpdates);

    modelUpdates.status = 'pubed';
    modelUpdates.pubed = true;

    let modelResult = await dataService.patch(rescModel.id, modelUpdates);

    return modelResult;
  }

  async storeByPfop (store, modelData, data, options, params) {
    const dataService = zeros.service('data/rescs');

    modelData.status = 'transcoding';

    let rescModel = await dataService.create(modelData);

    // 保存缩略图
    let thumbUpdates = await this.storeRescThumb(store, rescModel, data, {}, params);
    rescModel = await dataService.patch(rescModel.id, thumbUpdates);

    let modelResult = await this.checkPersistent(rescModel, params);

    return modelResult;
  }

  async patch (id, data, params) {
    if (!id) {
      throw new errors.InnerError('请提供资源id。');
    }

    const dataService = zeros.service('data/rescs');

    let rescModel = await dataService.get(id);

    if (!rescModel) {
      throw new errors.InnerError('资源不存在或已删除。');
    }

    if (rescModel.frzn) {
      throw new errors.InnerError('资源已冻结。');
    }

    return await Promise.resolve().then(() => {
      if (rescModel.rtype === 'image' || !data.thumb) {
        return;
      }

      const rescStore = this.getStore(rescModel.store);

      return this.storeRescThumb(rescStore, rescModel, data, {}, params).then((thumbUpdates) => {
        data = Object.assign({}, data, thumbUpdates);
      });
    }).then(() => {
      return dataService.patch(id, data);
    });
  }

  /**
   * remove - 删除资源
   * @param {string} key 资源名
   * @param {ref} data 数据
   */
  async remove (id) {
    if (!id) {
      throw new errors.InnerError('请提供资源id。');
    }

    const dataService = zeros.service('data/rescs');

    let rescModel = await dataService.get(id);

    if (!rescModel) {
      throw new errors.InnerError('资源不存在或已删除。');
    }

    if (rescModel.frzn) {
      throw new errors.InnerError('资源已冻结。');
    }

    const store = this.getStore(rescModel.store);

    if (!store) {
      throw new errors.InnerError(`未找到名称为"${rescModel.store}"的存储。`);
    }
    
    // TODO: 是否需要在删除前先冻结记录
    // rescModel = await dataService.patch(id, { frzn: true });

    const qiniuService = zeros.service('open/qiniu');

    let delOps = [];

    // 目前只支持七牛存储
    if (rescModel.storage === 'qiniu') {
      if (rescModel.thumb && !zeros.util.isUrl(rescModel.thumb)) {
        delOps.push(qiniuService.remove({ key: rescModel.thumb }));
      }

      if (rescModel.avatar && !zeros.util.isUrl(rescModel.avatar)) {
        delOps.push(qiniuService.remove({ key: rescModel.avatar }));
      }

      if (rescModel.path && !zeros.util.isUrl(rescModel.path)) {
        delOps.push(qiniuService.remove({ key: rescModel.path }));
      }
    }

    if (delOps.length) {
      await Promise.all(delOps);
    }

    rescModel = await dataService.remove(id);

    return rescModel;
  }

  async storeRescThumb (rescStore, rescModel, data, options, params) {
    options = Object.assign({}, options);

    let { destRescKey, thumbKey, avatarKey } = options;
    let thumbUrl = null;
    let avatarUrl = null;

    let destRescKeyData = await Promise.resolve().then(() => {
      return rescStore.getKey({ model: rescModel, params });
    });

    if (!destRescKey) {
      if (rescModel.path) {
        destRescKey = rescModel.path;
      } else {
        destRescKey = destRescKeyData.key;
      }
    }

    if (!thumbKey) {
      thumbKey = `${destRescKey}_thumb`;
    }

    if (!avatarKey) {
      // 用户头像
      if (rescStore.avatar && destRescKeyData.avatarKey) {
        avatarKey = `avatars/${destRescKeyData.avatarKey}`;
      }
    }

    if (rescModel.rtype === 'image') {
      thumbUrl = zeros.$resc.thumbUrl(destRescKey);
      avatarUrl = zeros.$resc.thumbUrl(destRescKey, 'avatar');
    } else {
      thumbUrl = data.thumb;
      avatarUrl = data.avatar;
    }

    let thumbUpdates = await this.storeThumb(rescModel, {
      thumbUrl, avatarUrl
    }, { thumbKey, avatarKey });

    return thumbUpdates;
  }

  async storeThumb (rescModel, data, options) {
    options = Object.assign({}, options);

    // 缩略图必须在模型存储后执行存储
    if (!rescModel || !rescModel._id) {
      return;
    }

    let { thumbUrl, avatarUrl } = data;
    let { thumbKey, avatarKey } = options;

    let updates = {};

    if (thumbUrl && thumbKey
      && !this.isSameThumbPath(thumbUrl, rescModel.thumb)) {
      await this.storeThumbByUrl(thumbUrl, thumbKey).then(() => {
        updates.thumb = thumbKey;
      });
    }

    // 保存avatar
    if (avatarUrl && avatarKey
      && !this.isSameThumbPath(avatarUrl, rescModel.avatar)) {
      await this.storeThumbByUrl(avatarUrl, avatarKey).then(() => {
        updates.thumb = avatarKey;
      });
    }

    return updates;
  }

  isSameThumbPath (thumbUrl, thumbPath) {
    if (!thumbUrl || !thumbPath) {
      return false;
    }

    // 判断缩略图的path是否相同
    let pathFullUrl = zeros.$resc.fullUrl(thumbPath);
    let flag = thumbUrl.indexOf(pathFullUrl) === 0;

    return flag;
  }

  async storeThumbByUrl (thumbUrl, thumbKey, fopName) {
    let tmpThumbKey = `TMP_EXP_1/${thumbKey}_` + new Date().getTime();
    let tmpThumbUrl = zeros.$resc.thumbUrl(tmpThumbKey, fopName, 'tmp');

    const qiniuService = zeros.service('open/qiniu');

    await qiniuService.fetch({
      url: thumbUrl,
      bucket: 'tmp',
      key: tmpThumbKey,
      options: { force: true }
    });

    await qiniuService.fetch({
      url: tmpThumbUrl,
      bucket: 'resc',
      key: thumbKey,
      options: { force: true }
    });

    return thumbKey;
  }

  // 检查转码状态
  async checkPersistent (rescModel, params) {
    let { user } = Object.assign({ app: {}, user: {} }, params);

    const dataService = zeros.service('data/rescs');
    const qiniuService = zeros.service('open/qiniu');

    if (typeof rescModel === 'string') {
      rescModel = await dataService.get(rescModel);
    }

    if (!rescModel) {
      throw new errors.NotFound('资源不存在。');
    }

    if (user && user.id && user.id !== rescModel.uid) {
      throw new errors.Forbidden('资源无法访问。');
    }

    if (rescModel.status !== 'transcoding') {
      return rescModel;
    }

    if (!rescModel.pfopid) {
      rescModel = await dataService.patch(rescModel.id, {
        status: 'transcoding_no_opid'
      });

      return rescModel;
    }

    let { pfopid } = rescModel;

    let prefopResult = await qiniuService.prefop(pfopid);

    if (!prefopResult
      || isNaN(prefopResult.code)
      || (prefopResult.code > 0 && prefopResult.code <= 2)) {
      return rescModel;
    }

    if (prefopResult.code > 2) {
      rescModel = await dataService.patch(rescModel.id, {
        status: 'transcoding_failed'
      });
      return rescModel;
    }

    let tmpKey = null;

    if (prefopResult.items && prefopResult.items.length) {
      let prefopItem = prefopResult.items[0];
      tmpKey = prefopItem.key;
    }

    const store = this.getStore(rescModel.store);

    rescModel = await this.storeByResc (store, rescModel, {
      tmpKey
    }, { force: true }, params);

    return rescModel;
  }

  // 重新转码，正在转码的资源无法执行转码
  async rePersistent (id, params) {
    const dataService = zeros.service('data/rescs');
    const qiniuService = zeros.service('open/qiniu');

    let rescModel = await this.checkPersistent(id, params);

    if (rescModel.pubed || rescModel.status === 'transcoding') {
      return rescModel;
    }

    if (!rescModel.pfopid) {
      throw new errors.Forbidden('未找到转码id。');
    }

    let prefopResult = await qiniuService.prefop(rescModel.pfopid);

    let prefopCmd = prefopResult.items[0].cmd;

    let pfopResult = await qiniuService.pfop({
      bucket: prefopResult.inputBucket,
      key: prefopResult.inputKey,
      fopCmds: [{ cmd: prefopCmd, pipeline: prefopResult.pipeline }],
      options: { force: true }
    });
    
    rescModel = await dataService.patch(id, {
      status: 'transcoding',
      pfopid: pfopResult.persistentId
    });

    return rescModel;
  }

  // 提交转码
  async postPersistent (key, rtype) {
    const qiniuService = zeros.service('open/qiniu');

    if (!key) {
      throw new errors.BadRequest('请提供资源信息。');
    }

    let fopKey = this.getFopKeyByRtype(rtype);

    if (!fopKey) {
      return new errors.BadRequest('不支持当前对当前资源进行转码。');
    }

    let pfopResult = await qiniuService.pfop({
      bucket: 'tmp',
      key: key,
      fops: [{ fopKey: fopKey }],
      options: { force: true }
    });

    return {
      persistentId: pfopResult.persistentId
    };
  }

  // 根据rtype获取Pfopkey
  getFopKeyByRtype (rtype) {
    switch (rtype) {
    case 'audio':
    case 'video':
      return rtype;
    default:
      return null;
    }
  }
}
