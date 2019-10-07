// users-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const { register } = app.get('dbClient');

  return register({
    id: { type: String, unique: true, maxlength: 50 },
    uname: { type: String, sparseUnique: true, maxlength: 50 },
    mobile: { type: String, sparseUnique: true },
    email: { type: String, sparseUnique: true, lowercase: true, trim: true },
    password: { type: String },

    weOpenId: { type: String, sparseUnique: true, maxlength: 100 },
    wxOpenId: { type: String, sparseUnique: true, maxlength: 100 },
    wxUnionId: { type: String, sparseUnique: true, maxlength: 100 },

    nickname: { type: String, maxlength: 50 },
    realname: { type: String, maxlength: 50 },
    gender: { type: Number },
    locale: { type: String },
    address: {
      title: { type: String, maxlength: 500 },
      country: { type: String, maxlength: 50 },
      province: { type: String, maxlength: 50 },
      city: { type: String, maxlength: 50 },
      district: { type: String, maxlength: 50 },
      street: { type: String, maxlength: 100 },
      streetNumber: { type: String, maxlength: 50 },
      town: { type: String, maxlength: 100 },
      village: { type: String, maxlength: 100 }
    },
    location: { type: Array },

    lastLogin: {
      ip: { type: String, maxlength: 50 },
      ts: { type: Date }
    }
  }, {
    docName: 'users',
    timestamps: true
  });
};
