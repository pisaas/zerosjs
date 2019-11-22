/**
 * 分类信息
 */
module.exports = function () {
  return {
    docName: 'cats',
    timestamps: true,

    attributes: {
      id: { type: 'string', required: true, unique: true, maxlength: 50 },
      appid: { type: 'string', required: true, maxlength: 50 }, // 所属app id
      uid: { type: 'string', required: true, maxlength: 50 },  // 创建人id
      uname: { type: 'string', maxlength: 100 },  // 创建人名称
  
      code: { type: 'string', required: true, maxlength: 100 },
      name: { type: 'string', required: true, maxlength: 100 },
      type: { type: 'string', required: true, maxlength: 100 }, // 分类类型 {10: app, 30: topic, 60: user}
      desc: { type: 'string' },
  
      pid: { type: 'string', required: true, maxlength: 50 },
      path: { type: 'string', required: true, maxlength: 500 },
      sn: { type: 'number', required: true },

      taxid: { type: 'string', maxlength: 50, default: '0' }, // 对应分类类型，默认0
      tid: { type: 'string', maxlength: 50 }, // 对应 topic id，可选
  
      data0: { type: 'json' }, // 草稿
      data: { type: 'json' },
      leaf: { type: 'boolean', default: true },
  
      pubed: { type: 'boolean' },
      frzn: { type: 'boolean' },
      modes: { type: 'array', default: [] },
      ctrls: { type: 'json' },
    },

    indexs: [
      { keys: { appid: 1, code: 1 }, options: { unique: true } }
    ]
  };
};
