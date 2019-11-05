// 关注人 appid
module.exports = function () {
  return {
    docName: 'flws',
    timestamps: true,

    attributes: {
      id: { type: 'string', required: true, unique: true, maxlength: 50 },  // follow id (type为10，则为openid)
      uid: { type: 'string', required: true, maxlength: 50 },
      type: { type: 'string', required: true, maxlength: 50 }, // 用户类型 10: 普通, 20: 成员
      appid: { type: 'string', required: true, maxlength: 50 },
  
      data: { type: 'json' },
      frzn: { type: 'boolean', default: false },
    }
  };
};
