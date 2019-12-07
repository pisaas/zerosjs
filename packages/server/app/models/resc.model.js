/**
 * 注册信息，存储系统配置
 */
module.exports = function () {
  return {
    docName: 'rescs',
    timestamps: true,

    attributes: {
      id: { type: 'string', required: true, unique: true, maxlength: 50 },
      appid: { type: 'string', required: true, maxlength: 50 }, // 所属appid
      uid: { type: 'string', required: true, maxlength: 50 },  // 一般为创建人id
      uname: { type: 'string', maxlength: 100 },  // 所有人名称

      name: { type: 'string', required: true, maxlength: 100 }, // 资源名
      stype: { type: 'string', required: true, protected: true, maxlength: 100 }, // 存储类型（app, tpc, usr）
      rtype: { type: 'string', required: true, maxlength: 100 }, // 资源类型（图片，视频，音频，文档等）
      
      store: { type: 'string', required: true, protected: true, maxlength: 100 },  // 存储名，如usr/avatar, app/logo, app/material等
      storage: { type: 'string', required: true, protected: true, maxlength: 100 },  // 存储方式
      pfopid: { type: 'string', protected: true }, // 数据处理队列id
      md5: { type: 'string', protected: true }, // 用于文件去重
      path: { type: 'string' }, // 文件路径
      thumb: { type: 'string' }, // 缩略图路径
      avatar: { type: 'string' }, // 头像、封面路径
      mime: { type: 'string' }, // mime类型
      fsize: { type: 'string' }, // 文件大小
      fname: { type: 'string' }, // 文件名
      desc: { type: 'string' }, // 资源描述,
      extra: { type: 'json' }, // 根据类型不同，文件附加信息

      status: { type: 'string', default: 'new' },
  
      pubed: { type: 'boolean' },
      frzn: { type: 'boolean' }
    },

    toJSON: {
      transform (doc, ret) {
        if (doc.path) {
          ret.path = zeros.$resc.fullUrl(`${doc.path}`);
        } else if (doc.extra && doc.extra.tmpRescKey) {
          ret.path = zeros.$resc.fullUrl(`${doc.extra.tmpRescKey}`, 'tmp');
        }

        if (doc.thumb) {
          ret.thumb = rescThumbUrl(doc.thumb, doc.path, doc.createdAt, 'thumb');
        } else if (doc.rtype === 'video') {
          ret.thumb = rescVideoThumbUrl(doc.path);
        }

        if (doc.avatar) {
          ret.avatar = rescThumbUrl(doc.avatar, doc.path, doc.createdAt, 'avatar');
        }
        
        let status = doc.status;

        if (!status) {
          if (doc.frzn) {
            status = 'frzn';
          } else if (doc.pubed) {
            status = 'pubed';
          } else {
            status = 'unpubed';
          }
        }

        ret.status = status;
        ret.statusName = zeros.$model.statusName(status);
        
        return ret;
      }
    }
  };
};

function rescThumbUrl (thumb, path, ts, fopName) {
  if (zeros.util.isUrl(thumb)) {
    return thumb;
  }

  if (!ts || !path) {
    return zeros.$resc.fullUrl(thumb);
  }

  // 5分钟后生效，（七牛处理缩略图预留5分钟时间）
  let activeDate = ts.addMinutes(5);
  if (Date.compare(new Date(), activeDate) > 0) {
    return zeros.$resc.fullUrl(thumb);
  }

  return zeros.$resc.thumbUrl(path, fopName);
}

function rescVideoThumbUrl (path) {
  if (!path) {
    return null;
  }

  return zeros.$resc.fullUrl(path) + '?vframe/jpg/offset/0';
}