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
      utype: { type: 'string', required: true, maxlength: 100 }, // 所属类型（app, tpc, usr）
      mtype: { type: 'string', required: true, maxlength: 100 }, // 资源类型（图片，视频，音频，文档等）
      
      store: { type: 'string', required: true, maxlength: 100 },  // 存储名，如usr/avatar, app/logo, app/material等
      storage: { type: 'string', required: true, maxlength: 100 },  // 存储方式
      hash: { type: 'string' }, // 用于文件去重，不同的存储方式对应不同的hash
      path: { type: 'string' }, // 文件路径
      mime: { type: 'string' }, // mime类型
      size: { type: 'string' }, // 文件大小
      data: { type: 'json' }, // 根据类型不同，文件附加信息
      desc: { type: 'string' }, // 资源描述

      status: { type: 'string', default: 'new' },
  
      pubed: { type: 'boolean' },
      frzn: { type: 'boolean' }
    }
  };
};
