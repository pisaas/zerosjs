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
      uname: { type: 'string', maxlength: 100 },  // 创建人名称
      
      code: { type: 'string', required: true, unique: true, maxlength: 50 },
      name: { type: 'string', required: true, unique: true, maxlength: 100 },
      logo: { type: 'string', required: true, maxlength: 200 },
  
      oid: { type: 'string', maxlength: 50 }, // 所属组织org id
      ocode: { type: 'string', maxlength: 50 }, // 所属组织编号org code
  
      desc: { type: 'string', maxlength: 500 },
      data: { type: 'json' },
      pubed: { type: 'boolean', default: false },
      frzn: { type: 'boolean', default: false },
    },

    toJSON: {
      transform (doc, ret) {
        let ts = (+doc.updatedAt);

        if (doc.logo) {
          ret.logo = zeros.$resc.fullUrl(`${doc.logo}?ts=${ts}`);
          ret.logo_thumb = zeros.$resc.fullUrl(`${doc.logo}_thumb?ts=${ts}`);
        }

        ret.avatar = zeros.$resc.fullUrl(`avatars/a_${doc.id}?ts=${ts}`);
        ret.status = zeros.$model.status(doc);
        ret.statusName = zeros.$model.statusName(ret.status);
        
        return ret;
      }
    }
  };
};
