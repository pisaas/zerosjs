// 分类对应对象 category objects
module.exports = function (app) {
  const { register, Types } = app.get('dbClient');

  return register({
    id: { type: String, required: true, unique: true, maxlength: 50 },  // follow id (type为10，则为openid)
    appid: { type: String, required: true, maxlength: 50 },  // 应用id
    uid: { type: String, required: true, maxlength: 50 },  // 所属成员, 一般为创建人id

    key: { type: String, required: true, maxlength: 100 },
    wips: Types.Mixed, // ip白名单 white ips
    data: Types.Mixed,
    frzn: { type: Boolean, default: false },
  }, {
    docName: 'api_keys',
    timestamps: true
  });
};
