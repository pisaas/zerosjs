const _ = require('lodash');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const TypesMap = {
  'string': String,
  'number': Number,
  'date': Date,
  'array': Array,
  'map': Map,
  'boolean': Boolean,
  'objectid': Schema.Types.ObjectId,
  'decimal': Schema.Types.Decimal128,
  'json': Schema.Types.Mixed,
  'mixed': Schema.Types.Mixed
};

module.exports = function() {
  /**
   * Expose plugin constructor
   *
   * @api private
   */
  return function Model(definition) {
    this.load = function (cb) {
      let { fields, options } = normalizeDef(definition);

      let schema = new Schema(fields, options);
      let { docName } = options;

      let model;

      try {
        model = mongoose.model(docName);
      } catch (e) {
        model = mongoose.model(docName, schema);
      }
      
      _.extend(model, {
        definition
      });

      cb(null, model);
    };
  };
};

function normalizeDef (definition) {
  let options = _.omit(definition, ['attributes']);

  let fields = {};
  let attributes = definition.attributes || {};

  // 默认被保护的字段
  let protectedFields = ['_id', '__v'];

  _.keys(attributes).forEach((key) => {
    let attribute = attributes[key];

    if (!attribute) {
      return;
    }

    let f = normalizeDefField(attribute);

    if (f.sparseUnique) {
      f.index = sparseUniqueIndex(key, f.index);
    }

    if (f.protected === true) {
      protectedFields.push(key);
    } else if (f.protected === false) {
      _.pull(protectedFields, key);
    }

    if (f.protected !== undefined) {
      delete f.protected;
    }

    fields[key] = f;
  });

  protectedFields = _.concat(protectedFields, (options.protectedFields || []));

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

  return { fields, options };
}

function normalizeDefField (attribute) {
  let field = Object.assign({}, attribute);

  let filedType = TypesMap[attribute.type];

  if (filedType) {
    field.type = filedType;
  } else if (_.isObject(field)) {
    _.keys(field).forEach((key) => {
      let f = field[key];
      field[key] = normalizeDefField(f);
    });
  }

  return field;
}

function protectFieldsTransform (pFields) {
  return function transformFn (doc, ret, options) {
    pFields = _.concat((pFields || []), (options.protectedFields || []));
    pFields.forEach((f) => {
      delete ret[f];
    });
    return ret;
  };
}

function sparseUniqueIndex (name) {
  return sparseIndex(name, { unique: true });
}

function sparseIndex (name, options) {
  return Object.assign({}, options, {
    partialFilterExpression: {[name]: {$type: 'string'}}
  });
}
