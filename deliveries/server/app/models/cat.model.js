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

      type: { type: 'string', required: true, maxlength: 100 }, // 分类类型 {app, tpc, usr}
      taxid: { type: 'string', maxlength: 50, default: '0' }, // 对应分类类型，默认0
      tid: { type: 'string', maxlength: 50 }, // 对应 topic id，可选
  
      code: { type: 'string', required: true, maxlength: 100 },
      name: { type: 'string', required: true, maxlength: 100 },
      desc: { type: 'string' },
  
      pid: { type: 'string', required: true, maxlength: 50 },
      path: { type: 'string', required: true, maxlength: 500 },
      sn: { type: 'number', required: true },
  
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
