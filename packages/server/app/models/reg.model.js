/**
 * 注册信息，存储系统配置
 */
module.exports = function () {
  return {
    docName: 'regs',
    timestamps: true,

    attributes: {
      id: { type: 'string', required: true, unique: true, maxlength: 50 },
      uid: { type: 'string', required: true, maxlength: 50 },  // 一般为创建人id
      
      code: { type: 'string', required: true, unique: true, maxlength: 100 },
      name: { type: 'string', required: true, maxlength: 100 },
      type: { type: 'string', required: true, maxlength: 100 },
  
      pid: { type: 'string', required: true, maxlength: 50 },
      path: { type: 'string', required: true, maxlength: 500 },
      sn: { type: 'number', required: true },
  
      desc: { type: 'string' },
      data0: { type: 'json' }, // 草稿
      data: { type: 'json' },
      leaf: { type: 'boolean', default: true },
  
      pubed: { type: 'boolean' },
      frzn: { type: 'boolean' },
      modes: { type: 'array', default: [] },
      ctrls: { type: 'json' },
    }
  };
};
