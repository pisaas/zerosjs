/**
 * 分类信息
 */
module.exports = function (app) {
  const { register, Types } = app.get('dbClient');

  return register({
    id: { type: String, required: true, unique: true, maxlength: 50 },
    appid: { type: String, required: true, maxlength: 50 }, // 所属app id
    uid: { type: String, required: true, maxlength: 50 },  // 所属成员, 一般为创建人id
    
    code: { type: String, required: true, unique: true, maxlength: 100 },
    name: { type: String, required: true, maxlength: 100 },
    type: { type: String, required: true, maxlength: 100 }, // 分类类型 {10: app, 30: topic, 60: user}

    desc: { type: String },

    data: Types.Mixed,
    frzn: { type: Boolean },
  }, {
    docName: 'tags',
    timestamps: true
  });
};
