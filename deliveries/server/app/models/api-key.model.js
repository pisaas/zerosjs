// 分类对应对象 category objects
module.exports = function () {
  return {
    docName: 'api_keys',
    timestamps: true,

    attributes: {
      id: { type: 'string', required: true, unique: true, maxlength: 50 },  // follow id (type为10，则为openid)
      appid: { type: 'string', required: true, maxlength: 50 },  // 应用id
      uid: { type: 'string', required: true, maxlength: 50 },  // 所属成员, 一般为创建人id

      key: { type: 'string', required: true, maxlength: 100 },
      wips: { type: 'json' }, // ip白名单 white ips
      data: { type: 'json' },
      frzn: { type: 'boolean', default: false },
    }
  };
};
