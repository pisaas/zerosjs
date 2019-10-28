// 草稿表
module.exports = function (app) {
  const { register, Types } = app.get('dbClient');

  return register({
    id: { type: String, required: true, unique: true, maxlength: 50 },  // follow id (type为10，则为openid)
    appid: { type: String, required: true, maxlength: 50 },
    uid: { type: String, required: true, maxlength: 50 },  // 创建人id
    key: { type: String, required: true, maxlength: 500 },

    data: Types.Mixed,
    revisions: { type: Number },
  }, {
    docName: 'dfts',
    timestamps: true
  });
};
