// 关注人（appid, topic）
module.exports = function (app) {
  const { register, Types } = app.get('dbClient');

  return register({
    id: { type: String, required: true, unique: true, maxlength: 50 },  // follow id (type为10，则为openid)
    appid: { type: String, required: true, maxlength: 50 },
    uid: { type: String, required: true, maxlength: 50 },
    type: { type: Number, required: true },  // 关注类型（0: 系统, 10: app, 20: cat, 30: topic, 50: tag）
    oid: { type: String, required: true, maxlength: 50 }, // object id, 关注对象id

    data: Types.Mixed,
    frzn: { type: Boolean, default: false },
  }, {
    docName: 'flws',
    timestamps: true
  });
};
