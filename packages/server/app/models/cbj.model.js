// 分类对应对象 category objects
module.exports = function () {
  return {
    docName: 'cbjs',
    timestamps: true,

    attributes: {
      id: { type: 'string', required: true, unique: true, maxlength: 50 },  // follow id (type为10，则为openid)
      appid: { type: 'string', required: true, maxlength: 50 },
      type: { type: 'number', required: true },  // 关注类型（10: app, 30: topic, 60: user）
      oid: { type: 'string', required: true, maxlength: 50 }, // object id, 关注对象id
  
      data: { type: 'json' },
      pubed: { type: 'boolean', default: false },
      frzn: { type: 'boolean', default: false },
    }
  };
};
