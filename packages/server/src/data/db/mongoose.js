const mongoose = require('mongoose');
const { logger } = require('../../lib/common');

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
    Object.keys(schema).forEach((key) => {
      let field = schema[key];

      if (field.sparseUnique) {
        field.index = sparseUniqueIndex(key, field.index);
      }
    });

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
    register,
    sparseIndex,
    sparseUniqueIndex
  };
}
