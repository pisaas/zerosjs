/**
 * Module dependencies.
 */
require('date-utils');

const _ = require('lodash');
const async = require('async');

const errors = require('@zerosjs/errors');

const util = require('../util');

module.exports = function exposeGlobals() {
  var zeros = this;

  global['zeros'] = zeros;
  global['_'] = _;
  global['async'] = async;

  zeros.$errors = errors;
  zeros.util = util;
};
