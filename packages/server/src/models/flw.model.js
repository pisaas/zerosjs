// 关注人 appid
module.exports = function (app) {
  const { register, Types } = app.get('dbClient');

  return register({
    id: { type: String, required: true, unique: true, maxlength: 50 },  // follow id (type为10，则为openid)
    uid: { type: String, required: true, maxlength: 50 },
    type: { type: String, required: true, maxlength: 50 }, // 用户类型 10: 普通, 20: 成员
    appid: { type: String, required: true, maxlength: 50 },

    data: Types.Mixed,
    frzn: { type: Boolean, default: false },
  }, {
    docName: 'flws',
    timestamps: true
  });
};
