const mongoose = require('mongoose');
const { logger } = require('../../common');

module.exports = function (app) {
  mongoose.connect(
    app.get('mongodb'),
    {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  ).catch(err => {
    logger.error(err);
    process.exit(1);
  });
  
  mongoose.Promise = global.Promise;

  app.set('mongooseClient', mongoose);

  app.set('dbClient', dbClient(app));
};

function dbClient (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  function register (schema, options) {
    options = Object.assign({}, options);

    let protectedFields = ['_id', '__v'];

    Object.keys(schema).forEach((key) => {
      let field = schema[key];

      if (field.sparseUnique) {
        field.index = sparseUniqueIndex(key, field.index);
      }

      if (field.protected === true) {
        protectedFields.push(key);
      }

      if (field.protected !== undefined) {
        delete field.protected;
      }
    });

    protectedFields = protectedFields.concat((options.protectedFields || []));

    let toJSONOptions = Object.assign({}, options.toJSON);

    let pTransformFn = protectFieldsTransform(protectedFields);

    if (toJSONOptions.transform) {
      let origTransformFn = toJSONOptions.transform;

      toJSONOptions.transform = (doc, ret, options) => {
        pTransformFn (doc, ret, options);
        origTransformFn(doc, ret, options);
      };
    } else {
      toJSONOptions.transform = pTransformFn;
    }

    options.toJSON = toJSONOptions;

    let s = new Schema(schema, options);

    let { docName } = options;

    let m;

    // This is necessary to avoid model compilation errors in watch mode
    // see https://github.com/Automattic/mongoose/issues/1251
    try {
      m = mongooseClient.model(docName);
    } catch (e) {
      m = mongooseClient.model(docName, s);
    }

    // m.ensureIndexes();

    return m;
  }

  // mongoose保护
  function protectFieldsTransform (pFields) {
    return function transformFn (doc, ret, options) {
      pFields = (pFields || []).concat(options.protectedFields || []);
      pFields.forEach((f) => {
        delete ret[f];
      });
      return ret;
    };
  }

  function sparseIndex (name, options) {
    return Object.assign({}, options, {
      partialFilterExpression: {[name]: {$type: 'string'}}
    });
  }

  function sparseUniqueIndex (name) {
    return sparseIndex(name, { unique: true });
  }

  return {
    mongooseClient,
    Schema,
    Types: Schema.Types,
    register,
    sparseIndex,
    sparseUniqueIndex
  };
}
