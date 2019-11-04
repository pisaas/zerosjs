/**
 * 分类信息
 */
module.exports = function (app) {
  const { register, Types } = app.get('dbClient');

  return register({
    id: { type: String, required: true, unique: true, maxlength: 50 },
    appid: { type: String, required: true, maxlength: 50 }, // 所属app id
    uid: { type: String, required: true, maxlength: 50 },  // 创建人id
    taxid: { type: String, required: true, maxlength: 50 }, // 对应分类类型
    tid: { type: String, required: true, maxlength: 50 }, // 对应 topic id

    code: { type: String, required: true, unique: true, maxlength: 100 },
    name: { type: String, required: true, maxlength: 100 },
    type: { type: String, required: true, maxlength: 100 }, // 分类类型 {10: app, 30: topic, 60: user}
    desc: { type: String },

    pid: { type: String, required: true, maxlength: 50 },
    path: { type: String, required: true, maxlength: 500 },
    sn: { type: Number, required: true },

    data0: Types.Mixed, // 草稿
    data: Types.Mixed,
    leaf: { type: Boolean, default: true },

    pubed: { type: Boolean },
    frzn: { type: Boolean },
    modes: { type: Array, default: [] },
    ctrls: Types.Mixed,
  }, {
    docName: 'cats',
    timestamps: true
  });
};
