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
 * @this {ZeroApp}
 * @api private
 */

module.exports = function exposeGlobals() {
  var zero = this;

  global['zero'] = zero;
  global['_'] = _;
  global['async'] = async;
};
