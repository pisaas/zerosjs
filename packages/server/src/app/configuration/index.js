/**
 * Module dependencies.
 */

const _ = require('lodash');

module.exports = function(zeros) {
  /**
   * Expose new instance of `Configuration`
   */
  return new Configuration();

  function Configuration() {
    /**
     * Load the configuration modules
     *
     * @api private
     */
    this.load = require('./load')(zeros);

    // Bind the context of all instance methods
    _.bindAll(this);
  }
};
