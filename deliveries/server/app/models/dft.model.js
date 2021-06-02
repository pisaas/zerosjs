// 草稿表
module.exports = function () {
  return {
    docName: 'dfts',
    timestamps: true,

    attributes: {
      id: { type: 'string', required: true, unique: true, maxlength: 50 },  // follow id (type为10，则为openid)
      appid: { type: 'string', required: true, maxlength: 50 },
      uid: { type: 'string', required: true, maxlength: 50 },  // 创建人id
      key: { type: 'string', required: true, maxlength: 500 },
  
      data: { type: 'json' },
      revisions: { type: 'number' },
    }
  };
};
