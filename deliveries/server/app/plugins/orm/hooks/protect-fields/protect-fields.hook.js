const { omit } = require('lodash');

// 保护部分字段如：password不被输出。
module.exports = (...fields) => (context) => {
  const result = context.dispatch || context.result;
  const o = (current) => {
    const data = typeof current.toJSON === 'function'
      ? current.toJSON() : current;
    return omit(data, fields);
  };

  if (!result) {
    return context;
  }

  if (Array.isArray(result)) {
    context.dispatch = result.map(o);
  } else if (result.data && context.method === 'find') {
    context.dispatch = Object.assign({}, result, {
      data: result.data.map(o)
    });
  } else {
    context.dispatch = o(result);
  }

  if (context.params && context.params.provider) {
    context.result = context.dispatch;
  }

  return context;
};
