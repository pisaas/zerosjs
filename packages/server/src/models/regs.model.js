/**
 * 注册信息，存储系统配置，分类信息等等
 */
module.exports = function (app) {
  const { register, Types } = app.get('dbClient');

  return register({
    id: { type: String, required: true, unique: true, maxlength: 50 },
    code: { type: String, required: true, unique: true, maxlength: 100 },
    name: { type: String, required: true, maxlength: 100 },
    type: { type: String, required: true, maxlength: 100 },

    pid: { type: String, required: true, maxlength: 50 },
    path: { type: String, required: true, maxlength: 500 },
    sn: { type: Number, required: true },

    desc: { type: String },
    data0: Types.Mixed, // 草稿
    data: Types.Mixed,
    leaf: { type: Boolean, default: true },

    pubed: { type: Boolean },
    frzn: { type: Boolean },
    modes: { type: Array, default: [] },
    ctrls: Types.Mixed,
  }, {
    docName: 'regs',
    timestamps: true
  });
};
