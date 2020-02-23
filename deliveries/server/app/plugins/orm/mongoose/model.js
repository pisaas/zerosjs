const _ = require('lodash');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const TypesMap = {
  'string': String,
  'text': String,
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
      let { fields, indexs, virtuals, options } = normalizeDef(definition);

      let schema = new Schema(fields, options);

      // TODO: 通常只在项目初期启动时执行，项目稳定期应当手工建立索引
      if (indexs && indexs.length) {
        indexs.forEach((idx) => {
          schema.index(idx.keys, idx.options);
        });
      }

      if (virtuals) {
        Object.keys(virtuals).forEach((key) => {
          let fn = virtuals[key];

          schema.virtual(key).get(function () {
            return fn(this);
          });
        });
      }

      let modelName = options.modelName || options.docName || options.collection;

      let model = mongoose.models[modelName];

      if (!model) {
        model = mongoose.model(modelName, schema);
      }
      
      _.extend(model, { definition });

      cb(null, model);
    };
  };
};

function normalizeDef (definition) {
  let options = _.omit(definition, ['attributes', 'indexs', 'virtuals']);

  let fields = {};
  let attributes = definition.attributes || {};
  let indexs = definition.indexs || [];
  let virtuals = definition.virtuals;

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
  options.collection = options.collection || options.docName;

  return { fields, indexs, virtuals, options };
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

  // 设置默认最大字段长度
  if (filedType === 'string' && !field.maxlength) {
    if (attribute.type === 'text') {
      field.maxlength = 10000;
    } else {
      field.maxlength = 2000;
    }
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
