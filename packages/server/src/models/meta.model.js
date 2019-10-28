// 分类对应对象 category objects
module.exports = function (app) {
  const { register, Types } = app.get('dbClient');

  return register({
    id: { type: String, required: true, unique: true, maxlength: 50 },  // follow id (type为10，则为openid)
    appid: { type: String, required: true, maxlength: 50 },
    type: { type: Number, required: true },  // 关注类型（10: app, 30: topic, 60: user）
    oid: { type: String, required: true, maxlength: 50 }, // object id, 关注对象id

    data: Types.Mixed,
    pubed: { type: Boolean, default: false },
    frzn: { type: Boolean, default: false },
  }, {
    docName: 'cbjs',
    timestamps: true
  });
};
