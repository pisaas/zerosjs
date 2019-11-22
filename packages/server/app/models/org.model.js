// orgs-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function () {
  return {
    docName: 'orgs',
    timestamps: true,

    attributes: {
      id: { type: 'string', required: true, unique: true, maxlength: 50 },
      uid: { type: 'string', required: true, maxlength: 50 },  // 一般为创建人id
      uname: { type: 'string', maxlength: 100 },  // 创建人名称
      
      code: { type: 'string', required: true, unique: true, maxlength: 50 },
      name: { type: 'string', required: true, unique: true, maxlength: 100 },
  
      logo: { type: 'string', maxlength: 200 },
      desc: { type: 'string', maxlength: 500 },
      data: { type: 'json' },
      pubed: { type: 'boolean', default: false },
      frzn: { type: 'boolean', default: false },
    }
  };
};
