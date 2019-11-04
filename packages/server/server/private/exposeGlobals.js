/**
 * Module dependencies.
 */

var _ = require('lodash');
var async = require('async');

module.exports = function exposeGlobals() {
  var zeros = this;

  global['zeros'] = zeros;
  global['_'] = _;
  global['async'] = async;
};
