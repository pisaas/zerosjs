// 订阅人（appid, topic）
module.exports = function () {
  return {
    docName: 'subs',
    timestamps: true,

    attributes: {
      id: { type: 'string', required: true, unique: true, maxlength: 50 },  // follow id (type为10，则为openid)
      appid: { type: 'string', required: true, maxlength: 50 },
      uid: { type: 'string', required: true, maxlength: 50 },
      uname: { type: 'string', maxlength: 100 },  // 创建人名称
      utype: { type: 'string', required: true, maxlength: 50 }, // 用户类型 10: 普通, 20: 成员
      type: { type: 'number', required: true },  // 关注类型（0: 系统, 10: app, 20: cat, 30: topic, 50: tag）
      oid: { type: 'string', required: true, maxlength: 50 }, // object id, 关注对象id
  
      notiLevel: { type: 'number', required: true },  // 通知级别
  
      data: { type: 'json' },
      frzn: { type: 'boolean', default: false },
    }
  };
};
