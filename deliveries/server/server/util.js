/* eslint-disable no-useless-escape */
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

const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
const localhostDomainRE = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/;
const nonLocalhostDomainRE = /^[^\s\.]+\.\S{2,}$/;

exports.isUrl = (str) => {

  if (typeof str !== 'string') {
    return false;
  }

  let match = str.match(protocolAndDomainRE);
  if (!match) {
    return false;
  }

  let everythingAfterProtocol = match[1];
  if (!everythingAfterProtocol) {
    return false;
  }

  if (localhostDomainRE.test(everythingAfterProtocol) ||
      nonLocalhostDomainRE.test(everythingAfterProtocol)) {
    return true;
  }

  return false;
};
