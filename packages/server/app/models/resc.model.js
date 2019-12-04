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
      md5: { type: 'string', protected: true }, // 用于文件去重
      path: { type: 'string' }, // 文件路径
      thumb: { type: 'string' }, // 缩略图路径
      avatar: { type: 'string' }, // 头像、封面路径
      mime: { type: 'string' }, // mime类型
      fsize: { type: 'string' }, // 文件大小
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
        }

        if (doc.thumb) {
          ret.thumb = zeros.$resc.thumbUrl(doc.thumb, doc.path, doc.createdAt, 'thumb');
        }

        if (doc.avatar) {
          ret.avatar = zeros.$resc.thumbUrl(doc.avatar, doc.path, doc.createdAt, 'avatar');
        }
        
        let status = this.status;
        let statusName = '';

        if (doc.frzn) {
          status = 'frozen';
          statusName = '已冻结';
        } else if (doc.pubed) {
          status = 'published';
          statusName = '已发布';
        } else {
          status = 'unpublished';
          statusName = '未发布';
        }

        ret.status = status;
        ret.statusName = statusName;
        
        return ret;
      }
    }
  };
};
