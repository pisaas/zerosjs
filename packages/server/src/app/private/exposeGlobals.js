/**
 * Module dependencies.
 */

var _ = require('lodash');
var async = require('async');

/**
 * exposeGlobals()
 *
 * Expose certain global variables
 * (if config says so)
 *
 * @throws E_BAD_GLOBAL_CONFIG
 *
 * @this {ZerosApp}
 * @api private
 */

module.exports = function exposeGlobals() {
  var zeros = this;

  global['zeros'] = zeros;
  global['_'] = _;
  global['async'] = async;
};
