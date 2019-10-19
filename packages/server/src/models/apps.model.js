// apps-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const { register, Types } = app.get('dbClient');

  return register({
    id: { type: String, required: true, unique: true, maxlength: 50 },
    code: { type: String, required: true, unique: true, maxlength: 50 },
    name: { type: String, required: true, unique: true, maxlength: 100 },

    oid: { type: String, required: true, maxlength: 50 }, // 所属组织org id
    ocode: { type: String, required: true, maxlength: 50 }, // 所属组织编号org code

    logo: { type: String, maxlength: 200 },
    desc: { type: String, maxlength: 500 },
    data: Types.Mixed,
    pubed: { type: Boolean, default: false },
    frzn: { type: Boolean, default: false },
  }, {
    docName: 'apps',
    timestamps: true
  });
};
