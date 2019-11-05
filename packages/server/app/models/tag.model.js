/**
 * 分类信息
 */
module.exports = function () {
  return {
    docName: 'tags',
    timestamps: true,

    attributes: {
      id: { type: 'string', required: true, unique: true, maxlength: 50 },
      appid: { type: 'string', required: true, maxlength: 50 }, // 所属app id
      uid: { type: 'string', required: true, maxlength: 50 },  // 所属成员, 一般为创建人id
      
      code: { type: 'string', required: true, unique: true, maxlength: 100 },
      name: { type: 'string', required: true, maxlength: 100 },
      type: { type: 'string', required: true, maxlength: 100 }, // 分类类型 {10: app, 30: topic, 60: user}
  
      desc: { type: 'string' },
  
      data: { type: 'json' },
      frzn: { type: 'boolean' },
    }
  };
};
