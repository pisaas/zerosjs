// users-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function () {
  return {
    docName: 'usrs',
    timestamps: true,

    attributes: {
      id: { type: 'string', required: true, unique: true, maxlength: 50 },
      type: { type: 'number', required: true, protected: true },  // 用户类型（0: 系统, 10: 个人，20: 企业，）
      
      uname: { type: 'string', sparseUnique: true, maxlength: 50 },
      mobile: { type: 'string', sparseUnique: true },
      email: { type: 'string', sparseUnique: true, lowercase: true, trim: true },
      weixin: { type: 'string', sparseUnique: true, lowercase: true, trim: true },
      password: { type: 'string', protected: true },
  
      level: { type: 'number', protected: true, default: 10 },  // trust level, 默认: 10
  
      weOpenId: { type: 'string', protected: true, sparseUnique: true, maxlength: 100 },
      wxOpenId: { type: 'string', protected: true, sparseUnique: true, maxlength: 100 },
      wxUnionId: { type: 'string', protected: true, sparseUnique: true, maxlength: 100 },
  
      nickname: { type: 'string', maxlength: 50 },
      realname: { type: 'string', maxlength: 50 },
      gender: { type: 'number' },
      locale: { type: 'string' },
      address: {
        title: { type: 'string', maxlength: 500 },
        country: { type: 'string', maxlength: 50 },
        province: { type: 'string', maxlength: 50 },
        city: { type: 'string', maxlength: 50 },
        district: { type: 'string', maxlength: 50 },
        street: { type: 'string', maxlength: 100 },
        streetNumber: { type: 'string', maxlength: 50 },
        town: { type: 'string', maxlength: 100 },
        village: { type: 'string', maxlength: 100 }
      },
      location: { type: 'array' },
  
      lastLogin: {
        protected: true,
        ip: { type: 'string', maxlength: 50 },
        ts: { type: Date }
      },
  
      refid: { type: 'string', maxlength: 50 },  // 推荐人id
      refname: { type: 'string', maxlength: 100 },  // 推荐人名称
    },

    virtuals: {
      displayName (doc) {
        return getUserDisplayName(doc);
      }
    },

    getUserDisplayName,

    toObject: {
      transform (doc, ret) {
        delete ret.password;
        ret.displayName = doc.displayName;
        return ret;
      }
    },

    toJSON: {
      transform (doc, ret) {
        ret.displayName = doc.displayName;
        return ret;
      }
    }
  };
};

function getUserDisplayName (doc) {
  if (!doc) {
    return null;
  }

  return doc.nickname ||
    doc.realname ||
    doc.uname ||
    doc.mobile ||
    doc.email ||
    doc.weixin ||
    doc.id;
}
