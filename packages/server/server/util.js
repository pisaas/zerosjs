const stringify = require('json-stringify-safe');

exports.stringify = stringify;

// 获取JSON对象
exports.parse = (str, defaultJson) => {
  defaultJson = defaultJson || null;
  let jsonObj = defaultJson;

  if (str) {
    try {
      jsonObj = JSON.parse(str);
    } catch (e) {
      if (zeros.log) {
        zeros.log.warn(e);
      }
    }

    if (typeof jsonObj === 'string') {
      jsonObj = defaultJson;
    }
  }

  return jsonObj;
};
