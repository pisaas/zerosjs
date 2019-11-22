// 主题
module.exports = function () {
  return {
    docName: 'tpcs',
    timestamps: true,

    attributes: {
      id: { type: 'string', required: true, unique: true, maxlength: 50 },
      appid: { type: 'string', required: true, maxlength: 50 }, // 所属app id
      uid: { type: 'string', required: true, maxlength: 50 },  // 创建人id
      uname: { type: 'string', maxlength: 100 },  // 创建人名称
      
      catid: { type: 'string', required: true, maxlength: 50 }, // 所属分类 id
      name: { type: 'string', required: true, maxlength: 200 },
  
      desc: { type: 'string', maxlength: 500 },
      data: { type: 'json' },
      cont: { type: 'text' },
      status: { type: 'string', default: 'new' },
      pubed: { type: 'boolean', default: false },
      frzn: { type: 'boolean', default: false },
    },
    
    toJSON: {
      transform (doc, ret) {
        if (ret.logo) {
          ret.logo = zeros.$resc.fullUrl(`${ret.logo}`);
        }
        
        let status = '';
        let statusName = '';

        if (doc.frzn) {
          status = 'frozen';
          statusName = '已冻结';
        } else if (doc.pubed) {
          status = 'published';
          statusName = '已发布';
        } else {
          status = 'unpublished';
          statusName = '未发布';
        }

        ret.status = status;
        ret.statusName = statusName;
        
        return ret;
      }
    }
  };
};
