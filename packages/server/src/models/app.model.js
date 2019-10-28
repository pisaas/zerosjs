// apps-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const { register, Types } = app.get('dbClient');

  return register({
    id: { type: String, required: true, unique: true, maxlength: 50 },
    uid: { type: String, required: true, maxlength: 50 },  // 创建人id
    
    code: { type: String, required: true, unique: true, maxlength: 50 },
    name: { type: String, required: true, unique: true, maxlength: 100 },

    oid: { type: String, maxlength: 50 }, // 所属组织org id
    ocode: { type: String, maxlength: 50 }, // 所属组织编号org code

    logo: { type: String, maxlength: 200 },
    desc: { type: String, maxlength: 500 },
    data: Types.Mixed,
    pubed: { type: Boolean, default: false },
    frzn: { type: Boolean, default: false },
  }, {
    docName: 'apps',
    timestamps: true,
    toJSON: {
      transform (doc, ret) {
        if (ret.logo) {
          ret.logo = zero.$resc.fullUrl(`${ret.logo}`);
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
  });
};
