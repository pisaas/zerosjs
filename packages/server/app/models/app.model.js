// apps-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function () {
  return {
    docName: 'apps',
    timestamps: true,

    attributes: {
      id: { type: 'string', required: true, unique: true, maxlength: 50 },
      uid: { type: 'string', required: true, maxlength: 50 },  // 创建人id
      
      code: { type: 'string', required: true, unique: true, maxlength: 50 },
      name: { type: 'string', required: true, unique: true, maxlength: 100 },
  
      oid: { type: 'string', maxlength: 50 }, // 所属组织org id
      ocode: { type: 'string', maxlength: 50 }, // 所属组织编号org code
  
      logo: { type: 'string', maxlength: 200 },
      desc: { type: 'string', maxlength: 500 },
      data: { type: 'json' },
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
